import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

/**
 * Cartao com o codigo de acompanhamento + botao "Copiar codigo". Usado na tela
 * de Protocolo (relato anonimo, `CE-...`) e na confirmacao do Atendimento
 * Psicologico (`AP-...`) — o mesmo visual para os dois, codigos e fluxos
 * separados.
 */
export function CartaoCodigo({ rotulo, codigo }: { rotulo: string; codigo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      toast.success("Código copiado.");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error("Não foi possível copiar. Anote o código manualmente.");
    }
  }

  return (
    <div className="rounded-[18px] bg-bege p-[18px_18px_16px] shadow-[var(--sombra-quente)]">
      <div className="text-[0.78rem] font-medium text-salvia mb-2.5">{rotulo}</div>
      <span
        className={`codigo font-mono font-semibold tracking-wide text-oliva break-all ${
          codigo.length > 18 ? "text-[1.08rem]" : "text-[1.4rem]"
        }`}
      >
        {codigo}
      </span>
      <div className="mt-3.5">
        <button
          onClick={copiar}
          className="btn-oco inline-flex items-center gap-2 rounded-xl px-4 py-[11px] text-sm font-semibold"
        >
          {copiado ? <Check className="w-[15px] h-[15px]" /> : <Copy className="w-[15px] h-[15px]" />}
          {copiado ? "Copiado" : "Copiar código"}
        </button>
      </div>
    </div>
  );
}
