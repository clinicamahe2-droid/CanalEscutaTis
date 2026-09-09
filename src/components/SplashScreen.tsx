import { useEffect, useState } from "react";

const DURACAO_MS = 3200;

/**
 * Abertura com a marca da TIS, mostrada uma vez por carregamento do app
 * (não por navegação — some sozinha, não bloqueia o carregamento por baixo).
 * Video de ~4s com a marca e o cenario do por do sol ja embutidos (ver
 * DECISOES.md, 2026-09-08) — nao precisa de texto/logo por cima.
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
      className={`fixed inset-0 z-[999] overflow-hidden bg-paper transition-opacity duration-[400ms] ease-smooth ${
        saindo ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <video
        className="w-full h-full object-cover"
        src="/video/splash-bg.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  );
}
