// POST /functions/v1/criar-atendimento
// body: { empresa_id, rascunho: { nome, setor, necessidade, contato? } }
// -> { codigo }   (codigo AP-AAAA-XXXX-XXXX-XXXX)
//
// Roda com service_role: o publico nunca insere em `solicitacoes_atendimento`
// direto (a policy anon de INSERT foi removida na migration 0005) porque o
// codigo precisa ser gerado no servidor, com retry em colisao.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { gerarCodigoAtendimento } from "../_shared/protocolo.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { empresa_id, rascunho } = await req.json();
    const nome = String(rascunho?.nome ?? "").trim();
    const setor = String(rascunho?.setor ?? "").trim();
    const necessidade = String(rascunho?.necessidade ?? "").trim();
    const contato = String(rascunho?.contato ?? "").trim();
    if (!empresa_id || !nome || !setor || !necessidade) return json({ erro: "dados incompletos" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let codigo: string | null = null;
    for (let i = 0; i < 5 && !codigo; i++) {
      const candidato = gerarCodigoAtendimento();
      const { error } = await admin.from("solicitacoes_atendimento").insert({
        empresa_id,
        codigo: candidato,
        nome,
        setor,
        necessidade,
        contato: contato || null,
        status: "nova",
      });
      if (!error) codigo = candidato;
      else if (!String(error.message).includes("duplicate")) throw error;
    }
    if (!codigo) return json({ erro: "colisao de codigo" }, 500);
    return json({ codigo });
  } catch (e) {
    return json({ erro: String(e?.message ?? e) }, 500);
  }
});
