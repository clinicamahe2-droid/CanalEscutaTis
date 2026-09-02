import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelaProps {
  titulo?: string;
  onVoltar?: () => void;
  /** 1..4 para mostrar os pontos de progresso do fluxo de relato. */
  passo?: 1 | 2 | 3 | 4;
  children: ReactNode;
  /** Acao fixa no rodape (normalmente o botao primario). */
  rodape?: ReactNode;
  className?: string;
  /** Desliga a animacao de entrada. Usar na tela de protocolo:
      o codigo tem que aparecer instantaneo, sem fade. */
  semAnimacao?: boolean;
}

export function Tela({ titulo, onVoltar, passo, children, rodape, className, semAnimacao }: TelaProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col px-5 safe-t">
        {(titulo || onVoltar || passo) && (
          <header className="flex items-center gap-3 py-3 min-h-[52px]">
            {onVoltar && (
              <button
                onClick={onVoltar}
                aria-label="Voltar"
                className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-paper-2 text-ink transition-colors duration-150 hover:bg-seal-tint"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {titulo && <h1 className="text-base font-semibold font-body text-ink">{titulo}</h1>}
            {passo && (
              <span className="ml-auto font-mono text-[0.65rem] tracking-wide text-record uppercase whitespace-nowrap">
                Passo 0{passo} de 04
              </span>
            )}
          </header>
        )}

        <main
          className={cn("flex-1 flex flex-col py-2", !semAnimacao && "animate-fade-in", className)}
        >
          {children}
        </main>

        {rodape && <div className="sticky bottom-0 bg-background pt-3 pb-4 safe-b space-y-2">{rodape}</div>}
      </div>
    </div>
  );
}
