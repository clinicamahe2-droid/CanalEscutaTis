// POST /functions/v1/responder-caso
//   origem "anonimo": { origem:"anonimo", empresa_id, protocolo, conteudo }
//   origem "equipe" , mensagem: { origem:"equipe", empresa_id, caso_id, conteudo }  (exige JWT da equipe)
//   origem "equipe" , status  : { origem:"equipe", acao:"status", empresa_id, caso_id, status, responsavel }
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // --------- mensagem anonima ---------
    if (body.origem === "anonimo") {
      const conteudo = String(body.conteudo ?? "").trim();
      if (!conteudo) return json({ erro: "mensagem vazia" }, 400);
      const { data: caso } = await admin
        .from("casos")
        .select("id, status")
        .eq("empresa_id", body.empresa_id)
        .eq("protocolo", String(body.protocolo).toUpperCase())
        .maybeSingle();
      if (!caso) return json({ erro: "nao encontrado" }, 404);

      const { data: cfg } = await admin
        .from("configuracoes_canal")
        .select("permitir_mensagens_pos_encerramento")
        .eq("empresa_id", body.empresa_id)
        .single();
      if (caso.status === "concluido" && !cfg?.permitir_mensagens_pos_encerramento) {
        return json({ erro: "caso encerrado" }, 409);
      }
      await admin.from("mensagens_caso").insert({
        caso_id: caso.id,
        empresa_id: body.empresa_id,
        remetente: "anonimo",
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

    if (body.acao === "status") {
      const { data: atual } = await admin
        .from("casos")
        .select("status")
        .eq("id", body.caso_id)
        .single();
      const patch: Record<string, unknown> = { status: body.status };
      if (body.status === "concluido") patch.encerrado_em = new Date().toISOString();
      if (body.status === "encaminhado") patch.encaminhado = true;
      const { data: caso } = await admin
        .from("casos")
        .update(patch)
        .eq("id", body.caso_id)
        .select()
        .single();
      await admin.from("historico_status").insert({
        caso_id: body.caso_id,
        empresa_id: body.empresa_id,
        status_anterior: atual?.status ?? null,
        status_novo: body.status,
        responsavel: body.responsavel ?? membro.nome,
      });
      return json(caso);
    }

    // mensagem da equipe
    const conteudo = String(body.conteudo ?? "").trim();
    if (!conteudo) return json({ erro: "mensagem vazia" }, 400);
    const { data: msg } = await admin
      .from("mensagens_caso")
      .insert({
        caso_id: body.caso_id,
        empresa_id: body.empresa_id,
        remetente: "equipe",
        conteudo,
      })
      .select()
      .single();
    return json(msg);
  } catch (e) {
    return json({ erro: String(e?.message ?? e) }, 500);
  }
});
