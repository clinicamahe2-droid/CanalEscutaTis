import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { useRelato } from "@/fluxo/RelatoContext";
import { toast } from "sonner";

export default function Protocolo() {
  const nav = useNavigate();
  const { protocoloGerado, reiniciar } = useRelato();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!protocoloGerado) nav("/", { replace: true });
  }, [protocoloGerado, nav]);

  if (!protocoloGerado) return null;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(protocoloGerado!);
      setCopiado(true);
      toast.success("Protocolo copiado.");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error("Não foi possível copiar. Anote o código manualmente.");
    }
  }

  return (
    <Tela
      className="justify-center text-center"
      rodape={
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => {
            reiniciar();
            nav("/", { replace: true });
          }}
        >
          Voltar ao início
        </Button>
      }
    >
      <div className="grid place-items-center w-14 h-14 rounded-full bg-success-soft text-success mx-auto mb-4">
        <Check className="w-7 h-7" />
      </div>
      <h1 className="text-lg font-display font-semibold mb-4">Relato enviado</h1>

      <div className="rounded-xl border border-border bg-surface2 p-4">
        <div className="text-xs font-mono uppercase text-muted-foreground mb-2">Seu protocolo</div>
        <div className="font-mono text-2xl font-semibold tracking-wide text-primary-dark break-all">
          {protocoloGerado}
        </div>
        <Button variant="outline" size="sm" className="mt-3" onClick={copiar}>
          {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiado ? "Copiado" : "Copiar código"}
        </Button>
      </div>

      <div className="mt-4 rounded-xl bg-warning-soft text-warning p-3 text-sm flex gap-2 text-left">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Guarde este código agora. É a única forma de acompanhar seu caso — não pedimos e-mail nem
          login, e não há como recuperá-lo depois.
        </p>
      </div>
    </Tela>
  );
}
