// POST /functions/v1/responder-atendimento
//   origem "pessoa": { origem:"pessoa", empresa_id, codigo, conteudo }
//   origem "equipe": { origem:"equipe", empresa_id, solicitacao_id, conteudo }  (exige JWT da equipe)
//
// Resposta da equipe move a solicitacao de "nova" para "em_contato".
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import { normalizarCodigoAtendimento } from "../_shared/protocolo.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const conteudo = String(body.conteudo ?? "").trim();
    if (!conteudo) return json({ erro: "mensagem vazia" }, 400);
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --------- mensagem da pessoa (so o codigo) ---------
    if (body.origem === "pessoa") {
      const { data: sol } = await admin
        .from("solicitacoes_atendimento")
        .select("id, status")
        .eq("empresa_id", body.empresa_id)
        .eq("codigo", normalizarCodigoAtendimento(body.codigo))
        .maybeSingle();
      if (!sol) return json({ erro: "nao encontrado" }, 404);
      if (sol.status === "concluida") return json({ erro: "atendimento encerrado" }, 409);
      await admin.from("mensagens_atendimento").insert({
        solicitacao_id: sol.id,
        empresa_id: body.empresa_id,
        remetente: "pessoa",
        conteudo,
      });
      return json({ ok: true });
    }

    // --------- equipe: exige JWT valido de membro da equipe ---------
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } },
    );
    const { data: auth } = await userClient.auth.getUser();
    if (!auth?.user) return json({ erro: "nao autenticado" }, 401);
    const { data: membro } = await admin
      .from("equipe_clinica")
      .select("nome")
      .eq("user_id", auth.user.id)
      .eq("empresa_id", body.empresa_id)
      .maybeSingle();
    if (!membro) return json({ erro: "sem permissao" }, 403);

    // confere que a solicitacao e da mesma empresa antes de gravar (a funcao usa service role)
    const { data: sol } = await admin
      .from("solicitacoes_atendimento")
      .select("id, status")
      .eq("id", body.solicitacao_id)
      .eq("empresa_id", body.empresa_id)
      .maybeSingle();
    if (!sol) return json({ erro: "nao encontrado" }, 404);

    const { data: msg } = await admin
      .from("mensagens_atendimento")
      .insert({
        solicitacao_id: sol.id,
        empresa_id: body.empresa_id,
        remetente: "equipe",
        conteudo,
      })
      .select()
      .single();
    if (sol.status === "nova") {
      await admin.from("solicitacoes_atendimento").update({ status: "em_contato" }).eq("id", sol.id);
    }
    return json(msg);
  } catch (e) {
    return json({ erro: String(e?.message ?? e) }, 500);
  }
});
