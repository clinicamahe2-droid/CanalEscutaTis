import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelaProps {
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

export function Tela({ onVoltar, passo, children, rodape, className, semAnimacao }: TelaProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <div className="mx-auto w-full max-w-md flex-1 flex flex-col px-5 safe-t">
        {(onVoltar || passo) && (
          <header className="flex items-center justify-between gap-3 py-1 min-h-[52px]">
            {onVoltar ? (
              <button
                onClick={onVoltar}
                aria-label="Voltar"
                className="shrink-0 grid place-items-center w-[38px] h-[38px] rounded-full bg-paper-2 text-ink transition-colors duration-150 hover:bg-bege-hover"
              >
                <ArrowLeft className="w-[17px] h-[17px]" />
              </button>
            ) : (
              <span />
            )}
            {passo && (
              <span className="font-body text-[0.78rem] font-medium text-salvia whitespace-nowrap">
                Passo <b className="font-semibold text-ink">{passo}</b> de 4
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

/** Titulo grande em serif, o padrao de toda tela do fluxo (ver
    redesign-proposta-fable.html, `.titulo`). `apoio` e a linha de contexto
    opcional abaixo (ver `.apoio` no mockup). */
export function TituloTela({ apoio, children }: { apoio?: ReactNode; children: ReactNode }) {
  return (
    <>
      <h1 className="text-[1.875rem] font-display font-medium leading-[1.12] tracking-[-0.012em] text-ink mb-2.5">
        {children}
      </h1>
      {apoio && <p className="text-[0.84rem] text-salvia mb-4">{apoio}</p>}
    </>
  );
}
