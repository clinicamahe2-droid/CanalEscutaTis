import { useState } from "react";
import { MODO_DADOS } from "@/data";
import { ler, gravar } from "@/data/armazenamento";
import { X } from "lucide-react";

/**
 * Aviso permanente enquanto o app roda sem backend real. Dono abrindo e vendo
 * dado "sumir" sem explicacao leria isso como bug.
 */
export function DemoBanner() {
  const [fechado, setFechado] = useState<boolean>(() => ler("demo-banner-fechado", false));
  if (MODO_DADOS !== "local" || fechado) return null;
  return (
    <div className="no-print bg-warning-soft text-warning text-xs sm:text-sm">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-3">
        <span className="font-semibold uppercase tracking-wide text-[0.68rem]">Modo demonstração</span>
        <span className="flex-1 text-warning/90">
          Os dados ficam salvos apenas neste navegador. Nada é enviado para um servidor.
        </span>
        <button
          aria-label="Fechar aviso"
          className="shrink-0 opacity-70 hover:opacity-100"
          onClick={() => {
            setFechado(true);
            gravar("demo-banner-fechado", true);
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
