import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useSolicitacoes, useMudarStatusSolicitacao } from "@/hooks/dados";
import { formatarDataHora } from "@/lib/datas";
import type { StatusSolicitacao } from "@/dominio/tipos";
import { cn } from "@/lib/utils";

const STATUS_ROTULO: Record<StatusSolicitacao, string> = {
  nova: "Nova",
  em_contato: "Em contato",
  concluida: "Concluída",
};

const STATUS_ORDEM: Record<StatusSolicitacao, number> = {
  nova: 0,
  em_contato: 1,
  concluida: 2,
};

function PillStatus({ s }: { s: StatusSolicitacao }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[0.68rem] font-semibold font-mono uppercase",
        s === "nova" && "bg-stamp-tint text-stamp",
        s === "em_contato" && "bg-primary-soft text-primary-dark",
        s === "concluida" && "bg-success-soft text-success",
      )}
    >
      {STATUS_ROTULO[s]}
    </span>
  );
}

export default function Atendimentos() {
  const { data, isLoading } = useSolicitacoes();
  const mudarStatus = useMudarStatusSolicitacao();
  const [abertoId, setAbertoId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const lista = [...(data ?? [])].sort(
    (a, b) => STATUS_ORDEM[a.status] - STATUS_ORDEM[b.status] || b.criado_em.localeCompare(a.criado_em),
  );
  const novas = (data ?? []).filter((s) => s.status === "nova").length;

  return (
    <div className="animate-fade-in">
      <header className="mb-4">
        <h1 className="text-xl font-display font-semibold">Atendimento Psicológico</h1>
        <p className="text-sm text-muted-foreground">
          {novas} novas · {data?.length ?? 0} no total
        </p>
      </header>

      <p className="text-xs text-muted-foreground mb-4 max-w-prose">
        Pedidos identificados: a pessoa quer ser procurada. Nunca aparecem na Caixa de Casos
        (fluxo anônimo) nem em relatórios agregados.
      </p>

      <div className="border border-border rounded-xl divide-y divide-border">
        {lista.length === 0 && (
          <div className="px-4 py-8 text-center text-muted-foreground text-sm">
            Nenhum pedido de atendimento ainda.
          </div>
        )}
        {lista.map((s) => {
          const aberto = abertoId === s.id;
          return (
            <div key={s.id}>
              <button
                onClick={() => setAbertoId(aberto ? null : s.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-primary-soft/50"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{s.nome}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.setor}</div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:inline">
                  {formatarDataHora(s.criado_em)}
                </span>
                <PillStatus s={s.status} />
              </button>
              {aberto && (
                <div className="px-4 pb-4 -mt-1">
                  <p className="text-sm text-foreground whitespace-pre-wrap bg-surface2 rounded-lg p-3">
                    {s.necessidade}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(Object.keys(STATUS_ROTULO) as StatusSolicitacao[]).map((st) => (
                      <button
                        key={st}
                        disabled={mudarStatus.isPending}
                        onClick={() => mudarStatus.mutate({ id: s.id, status: st })}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors duration-150",
                          s.status === st
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card hover:bg-secondary",
                        )}
                      >
                        {STATUS_ROTULO[st]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
