/**
 * Marca da Clínica Mahê (casa + galho) — usada no painel de marca do hero
 * da Home (ver DECISOES.md, 2026-09-03). Vetor único e reutilizável, mesmo
 * padrão do `Selo.tsx`: nunca redesenhado por tela.
 */
export function LogoMahe({ size = 42, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Clínica Mahê"
    >
      <defs>
        <linearGradient id="mahe-gold-grad" x1="10" y1="90" x2="90" y2="5">
          <stop offset="0" stopColor="#8B6239" />
          <stop offset="1" stopColor="#E7C48F" />
        </linearGradient>
      </defs>
      <path d="M16,44 L44,18" stroke="url(#mahe-gold-grad)" strokeWidth="4" />
      <path d="M60,20 L86,44" stroke="url(#mahe-gold-grad)" strokeWidth="4" />
      <path d="M16,44 L16,70 L28,70" stroke="url(#mahe-gold-grad)" strokeWidth="4" />
      <path d="M86,44 L86,70 L74,70" stroke="url(#mahe-gold-grad)" strokeWidth="4" />
      <path d="M50,76 C49,58 47,46 52,32 C55,23 62,16 72,10" stroke="url(#mahe-gold-grad)" strokeWidth="3.2" />
      <g fill="url(#mahe-gold-grad)" stroke="none">
        <path d="M50,65 C44,61 40,55 41,49 C47,51 51,56 50,65 Z" />
        <path d="M50,53 C56,50 61,45 61,39 C55,40 50,45 50,53 Z" />
        <path d="M51,43 C45,40 41,34 42,28 C48,30 52,35 51,43 Z" />
        <path d="M53,31 C59,28 64,23 64,17 C58,18 53,23 53,31 Z" />
        <path d="M60,19 C66,17 71,13 72,8 C66,8 61,13 60,19 Z" />
      </g>
    </svg>
  );
}
