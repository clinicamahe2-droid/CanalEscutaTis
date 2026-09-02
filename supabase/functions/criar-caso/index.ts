// POST /functions/v1/criar-caso
// body: { empresa_id, rascunho: { categoria, urgencia, relato, quer_retorno, anexo? } }
// -> { protocolo, caso_id }
//
// Roda com service_role (bypassa RLS): o publico nunca insere em `casos` direto.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { gerarProtocolo } from "../_shared/protocolo.ts";
import { CATEGORIA, calcularPrazoSla } from "../_shared/regras.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { empresa_id, rascunho } = await req.json();
    if (!empresa_id || !rascunho?.categoria) return json({ erro: "dados incompletos" }, 400);
    const relato = String(rascunho.relato ?? "").trim();
    if (relato.length < 10) return json({ erro: "relato muito curto" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const meta = CATEGORIA[rascunho.categoria] ?? CATEGORIA.assedio_moral;
    const urgenciaAlta = rascunho.urgencia === "alta";
    const gravidade = urgenciaAlta ? "critica" : meta.gravidade;
    const criado = new Date();

    // gera protocolo com retry em colisao (coluna UNIQUE)
    let inserido: { id: string; protocolo: string } | null = null;
    for (let i = 0; i < 5 && !inserido; i++) {
      const protocolo = gerarProtocolo();
      const { data, error } = await admin
        .from("casos")
        .insert({
          empresa_id,
          protocolo,
          categoria: rascunho.categoria,
          gravidade,
          status: "recebido",
          urgencia: urgenciaAlta ? "alta" : "baixa",
          canal_origem: "pwa",
          relato,
          quer_retorno: rascunho.quer_retorno !== false,
          sla_prazo: calcularPrazoSla(criado, gravidade),
        })
        .select("id, protocolo")
        .single();
      if (!error) inserido = data;
      else if (!String(error.message).includes("duplicate")) throw error;
    }
    if (!inserido) return json({ erro: "colisao de protocolo" }, 500);

    await admin.from("historico_status").insert({
      caso_id: inserido.id,
      empresa_id,
      status_anterior: null,
      status_novo: "recebido",
      responsavel: "sistema",
    });

    if (rascunho.anexo?.storage_path) {
      await admin.from("anexos").insert({
        caso_id: inserido.id,
        empresa_id,
        storage_path: rascunho.anexo.storage_path,
        nome: rascunho.anexo.nome ?? "anexo-1.jpg",
        tipo: rascunho.anexo.tipo ?? "image/jpeg",
        tamanho: rascunho.anexo.tamanho ?? 0,
      });
    }

    const regra = urgenciaAlta ? "imediato" : meta.regra;
    await admin.from("fila_notificacoes").insert({
      empresa_id,
      caso_id: inserido.id,
      protocolo: inserido.protocolo,
      canal: "email",
      destinatario: Deno.env.get("ALERTA_EMAIL_DESTINO") ?? "equipe-escuta@empresa.com.br",
      assunto: `[Canal de Escuta] Novo caso ${meta.rotulo} — ${inserido.protocolo}`,
      corpo:
        `Um novo relato entrou pelo canal.\n\nProtocolo: ${inserido.protocolo}\n` +
        `Categoria: ${meta.rotulo}\nGravidade: ${gravidade}\nRegra: ${regra}`,
      regra,
      enviado: false,
    });

    // dispara o envio imediato (best-effort — nao bloqueia a resposta)
    if (regra === "imediato") {
      admin.functions
        .invoke("enviar-alerta", { body: { empresa_id, caso_id: inserido.id } })
        .catch(() => {});
    }

    return json({ protocolo: inserido.protocolo, caso_id: inserido.id });
  } catch (e) {
    return json({ erro: String(e?.message ?? e) }, 500);
  }
});
