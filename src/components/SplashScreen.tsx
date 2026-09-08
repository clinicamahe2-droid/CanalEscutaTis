import { useEffect, useState } from "react";
import tisLogo from "@/assets/tis-logo.jpg";

const DURACAO_MS = 1400;

/**
 * Abertura com a marca da TIS, mostrada uma vez por carregamento do app
 * (não por navegação — some sozinha, não bloqueia o carregamento por baixo).
 * Ver DECISOES.md, 2026-09-08.
 */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [saindo, setSaindo] = useState(false);

  useEffect(() => {
    const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduzMovimento) {
      onDone();
      return;
    }
    const t1 = setTimeout(() => setSaindo(true), DURACAO_MS);
    const t2 = setTimeout(onDone, DURACAO_MS + 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[999] grid place-items-center bg-paper transition-opacity duration-[400ms] ease-smooth ${
        saindo ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center animate-fade-in">
        <img src={tisLogo} alt="" className="w-40 sm:w-48 h-auto" />
        <span className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-record">
          Canal de Escuta
        </span>
      </div>
    </div>
  );
}
