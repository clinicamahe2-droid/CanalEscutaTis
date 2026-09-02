/**
 * Selo de verificacao — a marca do produto (ver designsystemescuta.html, secao 4).
 *
 * Duas argolas concentricas + confirmacao central: anel externo solido (o
 * produto), anel interno pontilhado em `stamp` (o rito de protecao), check
 * central em `seal` (o relato foi recebido). Componente unico e reutilizavel
 * — nunca redesenhado tela a tela (Bloco 2-a). Reaparece na Home e na tela de
 * confirmacao/protocolo (Bloco 2-b), sempre com este mesmo SVG.
 */
export function Selo({ size = 52, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Selo de confidencialidade"
    >
      <circle cx="24" cy="24" r="19" stroke="hsl(var(--seal))" strokeWidth="1.3" />
      <circle
        cx="24"
        cy="24"
        r="14"
        fill="rgba(35,75,62,.06)"
        stroke="hsl(var(--stamp))"
        strokeWidth="1"
        strokeDasharray="1.5 3.2"
      />
      <path
        d="M17.5 24.2l4.3 4.3 8.7-9.4"
        stroke="hsl(var(--seal))"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
