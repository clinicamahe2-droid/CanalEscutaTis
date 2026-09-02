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
}

export function Tela({ titulo, onVoltar, passo, children, rodape, className }: TelaProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col px-5 safe-t">
        {(titulo || onVoltar || passo) && (
          <header className="flex items-center gap-3 py-3 min-h-[52px]">
            {onVoltar && (
              <button
                onClick={onVoltar}
                aria-label="Voltar"
                className="shrink-0 grid place-items-center w-9 h-9 rounded-full bg-surface2 text-foreground hover:bg-secondary"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            {titulo && <h1 className="text-base font-semibold font-body">{titulo}</h1>}
            {passo && (
              <div className="ml-auto flex gap-1.5">
                {[1, 2, 3, 4].map((p) => (
                  <span
                    key={p}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      p <= passo ? "bg-primary" : "bg-border",
                    )}
                  />
                ))}
              </div>
            )}
          </header>
        )}

        <main className={cn("flex-1 flex flex-col py-2 animate-fade-in", className)}>{children}</main>

        {rodape && <div className="sticky bottom-0 bg-background pt-3 pb-4 safe-b space-y-2">{rodape}</div>}
      </div>
    </div>
  );
}
