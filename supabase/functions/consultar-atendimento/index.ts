// POST /functions/v1/consultar-atendimento
//   { empresa_id, codigo } -> AtendimentoPublico | { nao_encontrado: true }
//
// Unico caminho pelo qual a pessoa "ve" o proprio atendimento. Devolve so o
// necessario — nunca nome, setor, contato ou a necessidade (ela ja sabe quem e).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { normalizarCodigoAtendimento } from "../_shared/protocolo.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const codigo = normalizarCodigoAtendimento(body.codigo);
    const { data: sol } = await admin
      .from("solicitacoes_atendimento")
      .select("id, codigo, status, criado_em")
      .eq("empresa_id", body.empresa_id)
      .eq("codigo", codigo)
      .maybeSingle();

    // resposta generica: nao revela se o codigo existe
    if (!sol) return json({ nao_encontrado: true });

    const { data: msgs } = await admin
      .from("mensagens_atendimento")
      .select("remetente, conteudo, criado_em")
      .eq("solicitacao_id", sol.id)
      .order("criado_em");

    return json({
      codigo: sol.codigo,
      status: sol.status,
      criado_em: sol.criado_em,
      mensagens: msgs ?? [],
      permiteResponder: sol.status !== "concluida",
    });
  } catch (e) {
    return json({ erro: String(e?.message ?? e) }, 500);
  }
});
