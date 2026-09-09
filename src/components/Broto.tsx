/**
 * Broto (sprig/leaf) — a marca do produto na pele "acolhedora" (ver
 * DECISOES.md, 2026-09-08; fonte: redesign-proposta-fable.html, simbolo
 * `i-broto`). Substitui o Selo (duas argolas + check) da pele Matcha: um
 * traco so, sem preenchimento, exceto as duas folhas em `--broto`. Usado na
 * marca da Home e na abertura do Protocolo/confirmacao — nunca redesenhado
 * tela a tela.
 */
export function Broto({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label="Canal de Escuta"
    >
      <path d="M12 21.5V10.5" />
      <path d="M12 14.5C7.5 14.5 5 11.6 5 7c4.6 0 7 2.9 7 7.5z" fill="var(--broto)" />
      <path d="M12 18.5c4.5 0 7-2.9 7-7.5-4.6 0-7 2.9-7 7.5z" fill="var(--broto)" />
    </svg>
  );
}
