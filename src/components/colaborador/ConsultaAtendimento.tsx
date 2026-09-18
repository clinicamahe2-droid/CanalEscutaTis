import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { cn } from "@/lib/utils";
import { formatarDataHora } from "@/lib/datas";
import { useConsultaAtendimento, useEnviarMensagemAtendimento } from "@/hooks/dados";
import type { StatusSolicitacao } from "@/dominio/tipos";
import { toast } from "sonner";

const STATUS_ROTULO: Record<StatusSolicitacao, string> = {
  nova: "Recebido, a equipe ainda vai ler",
  em_contato: "A equipe já está em contato",
  concluida: "Atendimento encerrado",
};

/**
 * Conversa do Atendimento Psicológico, aberta com o código `AP-...`. Tela
 * própria (não reaproveita a de relato anônimo): não tem linha do tempo de 4
 * etapas nem pesquisa de encerramento, e nunca mostra nome/setor de volta.
 */
export function ConsultaAtendimento({ codigo, onVoltar }: { codigo: string; onVoltar: () => void }) {
  const consulta = useConsultaAtendimento(codigo, true);
  const enviar = useEnviarMensagemAtendimento(codigo);
  const [msg, setMsg] = useState("");

  async function enviarMsg() {
    if (!msg.trim()) return;
    try {
      await enviar.mutateAsync(msg.trim());
      setMsg("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar.");
    }
  }

  const dados = consulta.data;

  return (
    <Tela onVoltar={onVoltar}>
      <h1 className="font-mono text-lg font-semibold tracking-wide text-ink mb-1 break-all">{codigo}</h1>

      {consulta.isLoading && (
        <div className="grid place-items-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-seal" />
        </div>
      )}

      {!consulta.isLoading && !dados && (
        <div className="mt-3 rounded-xl border border-line-2 bg-card p-5 text-sm text-ink-2">
          Código não encontrado. Verifique se digitou exatamente como recebeu: maiúsculas, números e
          hífens. Por segurança, não informamos se um código existe ou não.
        </div>
      )}

      {dados && (
        <>
          <p className="text-sm text-salvia mb-4">{STATUS_ROTULO[dados.status]}</p>

          <div className="space-y-2">
            {dados.mensagens.length === 0 && (
              <p className="text-sm text-ink-2">
                Ainda não há mensagens. A equipe responde por aqui: volte a este código mais tarde.
              </p>
            )}
            {dados.mensagens.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-xl p-3 text-sm max-w-[88%]",
                  m.remetente === "equipe" ? "bg-paper-2 text-ink" : "bg-seal-tint text-ink ml-auto",
                )}
              >
                <div className="text-[0.6rem] font-mono uppercase text-record mb-1">
                  {m.remetente === "equipe" ? "Equipe de Escuta" : "Você"} · {formatarDataHora(m.criado_em)}
                </div>
                <span className="whitespace-pre-wrap">{m.conteudo}</span>
              </div>
            ))}
          </div>

          {dados.permiteResponder ? (
            <div className="flex gap-2 mt-3">
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Escrever uma resposta…"
                className="flex-1 min-h-[44px] rounded-xl border border-input bg-card p-2.5 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="icon" onClick={enviarMsg} disabled={enviar.isPending || !msg.trim()}>
                {enviar.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          ) : (
            <p className="text-xs text-ink-2 mt-3">
              Este atendimento foi encerrado e não aceita novas mensagens. Se precisar de novo, é só
              fazer um novo pedido.
            </p>
          )}
        </>
      )}
    </Tela>
  );
}
