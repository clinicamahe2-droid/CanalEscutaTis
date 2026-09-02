// POST /functions/v1/responder-pesquisa
// body: { empresa_id, protocolo, avaliacao, comentario }
// Idempotente: uma pesquisa por caso.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { empresa_id, protocolo, avaliacao, comentario } = await req.json();
    if (!["nao_ouvido", "em_parte", "ouvido"].includes(avaliacao)) {
      return json({ erro: "avaliacao invalida" }, 400);
    }
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: caso } = await admin
      .from("casos")
      .select("id, status")
      .eq("empresa_id", empresa_id)
      .eq("protocolo", String(protocolo).toUpperCase())
      .maybeSingle();
    if (!caso) return json({ erro: "nao encontrado" }, 404);
    if (caso.status !== "concluido") return json({ erro: "caso nao encerrado" }, 409);

    const { data: existe } = await admin
      .from("pesquisa_encerramento")
      .select("id")
      .eq("caso_id", caso.id)
      .maybeSingle();
    if (existe) return json({ ok: true, jaRespondida: true });

    await admin.from("pesquisa_encerramento").insert({
      caso_id: caso.id,
      empresa_id,
      avaliacao,
      comentario: (comentario ?? "").trim() || null,
    });
    return json({ ok: true });
  } catch (e) {
    return json({ erro: String(e?.message ?? e) }, 500);
  }
});
