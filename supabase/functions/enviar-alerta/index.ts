// POST /functions/v1/enviar-alerta
// body: { empresa_id, caso_id }
//
// Ponto de extensao dos alertas. Hoje: e-mail transacional (Resend).
// WhatsApp do nivel critico fica estruturado abaixo, mas NAO implementado —
// depende da decisao de canal (WhatsApp Business API vs. automacao simples).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

async function enviarEmail(para: string, assunto: string, corpo: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) {
    console.log("[enviar-alerta] RESEND_API_KEY ausente — e-mail nao enviado:", assunto);
    return false;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: Deno.env.get("ALERTA_EMAIL_FROM") ?? "canal-escuta@example.com",
      to: [para],
      subject: assunto,
      text: corpo,
    }),
  });
  return r.ok;
}

// -------------------------------------------------------------------
// TODO (fase 2, apos decisao de canal): enviar WhatsApp no nivel critico.
// Aqui entra a chamada a WhatsApp Business API (template aprovado pela Meta)
// ou ao webhook da automacao simples. Manter esta funcao isolada.
// -------------------------------------------------------------------
async function enviarWhatsappCritico(_para: string, _texto: string): Promise<boolean> {
  console.log("[enviar-alerta] WhatsApp critico ainda nao implementado (ver Fase 0).");
  return false;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { empresa_id, caso_id } = await req.json();
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: pendentes } = await admin
      .from("fila_notificacoes")
      .select("*")
      .eq("empresa_id", empresa_id)
      .eq("caso_id", caso_id)
      .eq("enviado", false);

    for (const n of pendentes ?? []) {
      const ok = await enviarEmail(n.destinatario, n.assunto, n.corpo);
      if (n.regra === "imediato") {
        await enviarWhatsappCritico(
          Deno.env.get("ALERTA_WHATSAPP_DESTINO") ?? "",
          `${n.assunto}\n\n${n.corpo}`,
        );
      }
      if (ok) await admin.from("fila_notificacoes").update({ enviado: true }).eq("id", n.id);
    }
    return json({ ok: true, processados: pendentes?.length ?? 0 });
  } catch (e) {
    return json({ erro: String(e?.message ?? e) }, 500);
  }
});
