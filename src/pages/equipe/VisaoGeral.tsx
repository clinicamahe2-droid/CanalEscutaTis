import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useDadosPainel } from "@/hooks/dados";
import {
  indicadoresGerais,
  mapaDeRisco,
  tendenciaMensal,
} from "@/dominio/agregacoes";

function Stat({
  n,
  rot,
  tom,
}: {
  n: string;
  rot: string;
  tom?: "warn" | "crit" | "ok";
}) {
  const cor =
    tom === "warn"
      ? "text-warning"
      : tom === "crit"
        ? "text-critical"
        : tom === "ok"
          ? "text-success"
          : "text-foreground";
  return (
    <div className="bg-card p-4">
      <div className={`font-mono text-2xl font-semibold tabular-nums ${cor}`}>{n}</div>
      <div className="text-[0.66rem] text-muted-foreground uppercase tracking-wide font-mono mt-1">
        {rot}
      </div>
    </div>
  );
}

export default function VisaoGeral() {
  const { data, isLoading } = useDadosPainel();

  const calc = useMemo(() => {
    if (!data) return null;
    return {
      ind: indicadoresGerais(data.casos, data.mensagens, data.pesquisas),
      risco: mapaDeRisco(data.casos.filter((c) => c.status !== "concluido")),
      tend: tendenciaMensal(data.casos, 6),
    };
  }, [data]);

  if (isLoading || !calc) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const { ind, risco, tend } = calc;
  const maxTend = Math.max(1, ...tend.map((t) => t.total));

  return (
    <div className="animate-fade-in">
      <header className="mb-5">
        <h1 className="text-xl font-display font-semibold">Visão Geral</h1>
        <p className="text-sm text-muted-foreground">Números calculados a partir dos casos.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border rounded-xl overflow-hidden mb-6">
        <Stat n={String(ind.casosAbertos)} rot="Casos abertos" />
        <Stat
          n={ind.tempoMedioPrimeiraRespostaDias == null ? "—" : `${ind.tempoMedioPrimeiraRespostaDias} d`}
          rot="Tempo médio até 1ª resposta"
          tom="ok"
        />
        <Stat n={String(ind.casosForaDoPrazo)} rot="Fora do prazo" tom={ind.casosForaDoPrazo > 0 ? "crit" : undefined} />
        <Stat
          n={ind.percentualOuvido == null ? "—" : `${ind.percentualOuvido}%`}
          rot="Sentiram-se ouvidos*"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-4">
        <Reveal as="section" className="rounded-xl border border-border p-5">
          <h2 className="text-sm font-display font-semibold mb-4">
            Mapa de risco por categoria <span className="font-body font-normal text-muted-foreground">(casos abertos)</span>
          </h2>
          {risco.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum caso aberto no momento.</p>
          )}
          <div className="space-y-2.5">
            {risco.map((f) => (
              <div key={f.categoria} className="grid grid-cols-[130px_1fr_28px] gap-2.5 items-center text-sm">
                <span className="text-foreground/80 truncate">{f.rotulo}</span>
                <span className="h-2 rounded-full bg-surface2 overflow-hidden">
                  <span
                    className="block h-full bg-primary rounded-full"
                    style={{ width: `${Math.max(6, f.proporcao)}%` }}
                  />
                </span>
                <span className="font-mono text-right text-muted-foreground">{f.total}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal as="section" delay={80} className="rounded-xl border border-border p-5">
          <h2 className="text-sm font-display font-semibold mb-4">Casos por mês</h2>
          <div className="flex items-end gap-2.5 h-32 pt-5">
            {tend.map((t, i) => (
              <div key={t.chave} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="relative w-full">
                  <span className="absolute -top-5 inset-x-0 text-center font-mono text-[0.62rem] text-muted-foreground">
                    {t.total}
                  </span>
                  <div
                    className={`w-full rounded-t ${i === tend.length - 1 ? "bg-primary" : "bg-primary-soft"}`}
                    style={{ height: `${(t.total / maxTend) * 90 + 4}px` }}
                  />
                </div>
                <div className="mt-1.5 font-mono text-[0.62rem] text-muted-foreground">{t.rotulo}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <p className="text-xs text-muted-foreground">
        *Com base nas pesquisas de encerramento respondidas — ver a aba Relatórios.
      </p>
    </div>
  );
}
