/**
 * Rótulo de seção com número + friso — elemento emprestado do DS "Digital
 * Architect" (ver DECISOES.md, 2026-09-08), adaptado aos tokens do sistema
 * (`record`/`line-2`, não o cinza-pedra do DS original). Uso pontual, não
 * substitui os rótulos mono simples já usados em todo o app.
 */
export function Eyebrow({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-mono text-[0.65rem] text-record">{n}</span>
      <div className="h-px w-6 bg-line-2" />
      <span className="font-mono text-[0.65rem] uppercase tracking-wide text-record">{children}</span>
    </div>
  );
}
