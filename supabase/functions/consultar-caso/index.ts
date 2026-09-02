// POST /functions/v1/consultar-caso
//   { acao: "config_publica", empresa_id }               -> ConfigPublica
//   { acao: "status", empresa_id, protocolo }            -> CasoPublico | { nao_encontrado: true }
//
// Unico caminho pelo qual o publico "ve" um caso. Devolve apenas a visao
// publica — nunca setor, nota interna, gravidade ou historico.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { CATEGORIA } from "../_shared/regras.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    if (body.acao === "config_publica") {
      const { data } = await admin
        .from("configuracoes_canal")
        .select("nome_canal, mensagem_boas_vindas, categorias_ativas, permitir_anexos")
        .eq("empresa_id", body.empresa_id)
        .single();
      return json(
        data ?? {
          nome_canal: "Canal de Escuta",
          mensagem_boas_vindas: "",
          categorias_ativas: [],
          permitir_anexos: true,
        },
      );
    }

    // acao === "status"
    const protocolo = String(body.protocolo ?? "").toUpperCase();
    const { data: caso } = await admin
      .from("casos")
      .select("id, protocolo, categoria, status, criado_em, quer_retorno")
      .eq("empresa_id", body.empresa_id)
      .eq("protocolo", protocolo)
      .maybeSingle();

    // resposta generica: nao revela se o protocolo existe
    if (!caso) return json({ nao_encontrado: true });

    const [{ data: msgs }, { data: cfg }, { data: pesq }] = await Promise.all([
      admin
        .from("mensagens_caso")
        .select("remetente, conteudo, criado_em")
        .eq("caso_id", caso.id)
        .order("criado_em"),
      admin
        .from("configuracoes_canal")
        .select("pesquisa_encerramento_ativa, permitir_mensagens_pos_encerramento")
        .eq("empresa_id", body.empresa_id)
        .single(),
      admin.from("pesquisa_encerramento").select("id").eq("caso_id", caso.id).maybeSingle(),
    ]);

    const concluido = caso.status === "concluido";
    return json({
      protocolo: caso.protocolo,
      categoriaRotulo: CATEGORIA[caso.categoria]?.rotulo ?? caso.categoria,
      status: caso.status,
      criado_em: caso.criado_em,
      quer_retorno: caso.quer_retorno,
      mensagens: msgs ?? [],
      permiteResponder: !concluido || !!cfg?.permitir_mensagens_pos_encerramento,
      pesquisaLiberada: concluido && !!cfg?.pesquisa_encerramento_ativa && !pesq,
      pesquisaRespondida: !!pesq,
    });
  } catch (e) {
    return json({ erro: String(e?.message ?? e) }, 500);
  }
});
