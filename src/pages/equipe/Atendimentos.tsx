import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  useSolicitacoes,
  useMudarStatusSolicitacao,
  useMensagensAtendimento,
  useResponderAtendimento,
} from "@/hooks/dados";
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

function ConversaAtendimento({ solicitacaoId, encerrado }: { solicitacaoId: string; encerrado: boolean }) {
  const { data: mensagens, isLoading } = useMensagensAtendimento(solicitacaoId, true);
  const responder = useResponderAtendimento(solicitacaoId);
  const [texto, setTexto] = useState("");

  async function enviar() {
    if (!texto.trim()) return;
    try {
      await responder.mutateAsync(texto.trim());
      setTexto("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar.");
    }
  }

  return (
    <div className="mt-4">
      <div className="text-xs font-semibold text-muted-foreground mb-2">Conversa com a pessoa</div>
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      <div className="space-y-2">
        {!isLoading && (mensagens?.length ?? 0) === 0 && (
          <p className="text-xs text-muted-foreground">Nenhuma mensagem ainda.</p>
        )}
        {mensagens?.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-lg p-2.5 text-sm max-w-[90%]",
              m.remetente === "equipe" ? "bg-primary-soft ml-auto" : "bg-surface2",
            )}
          >
            <div className="text-[0.62rem] font-mono uppercase text-muted-foreground mb-0.5">
              {m.remetente === "equipe" ? "Equipe" : "Pessoa"} · {formatarDataHora(m.criado_em)}
            </div>
            <span className="whitespace-pre-wrap">{m.conteudo}</span>
          </div>
        ))}
      </div>
      {!encerrado && (
        <div className="flex gap-2 mt-3">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escrever uma resposta pra pessoa…"
            className="flex-1 min-h-[44px] rounded-lg border border-input bg-card p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button size="icon" onClick={enviar} disabled={responder.isPending || !texto.trim()} aria-label="Enviar resposta">
            {responder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
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
        Pedidos identificados: a pessoa acompanha a resposta pelo código, dentro do app. Nunca aparecem na Caixa de Casos
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
                  <p className="text-xs text-muted-foreground mt-2">
                    Código de acompanhamento: <span className="font-mono">{s.codigo}</span>
                  </p>
                  <ConversaAtendimento solicitacaoId={s.id} encerrado={s.status === "concluida"} />
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
