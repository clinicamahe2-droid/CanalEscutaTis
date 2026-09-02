import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { Selo } from "@/components/Selo";
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
      semAnimacao
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
      {/* Mesmo selo da Home — reforca "recebido e tratado com cuidado formal"
          (Bloco 2-b), nao um icone novo por tela. */}
      <Selo size={64} className="mx-auto mb-4" />
      <span className="font-mono text-[0.68rem] tracking-wide text-record uppercase">
        Relato recebido
      </span>
      <h1 className="text-2xl font-display font-medium text-ink mt-1.5 mb-5">Protocolo emitido</h1>

      <div className="rounded-xl border border-line-2 bg-paper-2 p-4">
        <div className="text-xs font-mono uppercase text-record mb-2">Seu protocolo</div>
        <div className="font-mono text-2xl font-semibold tracking-wide text-ink break-all">
          {protocoloGerado}
        </div>
        <Button variant="outline" size="sm" className="mt-3" onClick={copiar}>
          {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copiado ? "Copiado" : "Copiar código"}
        </Button>
      </div>

      {/* Instrucao importante, nao um alarme de risco — sem `signal`
          (ver DECISOES.md Bloco 4-d). Callout no mesmo estilo da Home/Revisao. */}
      <div className="mt-4 border-l-2 border-seal pl-4 py-1 text-sm text-ink-2 text-left">
        <b className="text-ink">Guarde este código agora.</b> É a única forma de acompanhar seu
        caso — não pedimos e-mail nem login, e não há como recuperá-lo depois.
      </div>
    </Tela>
  );
}
