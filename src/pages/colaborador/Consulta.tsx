import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Send, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela, TituloTela } from "@/components/colaborador/Tela";
import { Eyebrow } from "@/components/colaborador/Eyebrow";
import { cn } from "@/lib/utils";
import { normalizarProtocolo, protocoloValido } from "@/dominio/protocolo";
import { formatarDataHora } from "@/lib/datas";
import { useConsultaCaso, useEnviarMensagemAnonima, useResponderPesquisa } from "@/hooks/dados";
import type { StatusCaso, AvaliacaoEncerramento } from "@/dominio/tipos";
import { toast } from "sonner";

const CHAVE_SESSAO = "ce.v1.consulta-protocolo";
const ETAPAS = ["Recebido", "Triagem", "Em andamento", "Concluído"];

function etapaAtual(status: StatusCaso): number {
  switch (status) {
    case "recebido":
      return 0;
    case "triagem":
      return 1;
    case "em_andamento":
    case "encaminhado":
      return 2;
    case "concluido":
      return 3;
  }
}

function Timeline({ status }: { status: StatusCaso }) {
  const atual = etapaAtual(status);
  return (
    <div className="flex justify-between my-4">
      {ETAPAS.map((rot, i) => (
        <div key={rot} className="flex flex-col items-center gap-1.5 flex-1">
          <div
            className={cn(
              "w-4 h-4 rounded-full border-2",
              i <= atual && "bg-seal border-seal",
              i > atual && "bg-card border-line-2",
            )}
          />
          <span className="text-[0.6rem] text-ink-2 text-center leading-tight">{rot}</span>
        </div>
      ))}
    </div>
  );
}

const OPCOES_PESQUISA: { v: AvaliacaoEncerramento; emoji: string; rot: string }[] = [
  { v: "nao_ouvido", emoji: "🙁", rot: "Não fui ouvido" },
  { v: "em_parte", emoji: "😐", rot: "Em parte" },
  { v: "ouvido", emoji: "🙂", rot: "Fui levado a sério" },
];

export default function Consulta() {
  const nav = useNavigate();
  const [entrada, setEntrada] = useState("");
  const [protocolo, setProtocolo] = useState<string>(() => {
    try {
      return sessionStorage.getItem(CHAVE_SESSAO) || "";
    } catch {
      return "";
    }
  });
  const consulta = useConsultaCaso(protocolo, !!protocolo);

  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem(CHAVE_SESSAO);
      } catch {
        /* noop */
      }
    };
  }, []);

  function buscar() {
    const norm = normalizarProtocolo(entrada);
    if (!protocoloValido(norm)) {
      toast.error("Código incompleto. Confira o protocolo (formato CE-AAAA-XXXX-XXXX).");
      return;
    }
    setProtocolo(norm);
    try {
      sessionStorage.setItem(CHAVE_SESSAO, norm);
    } catch {
      /* noop */
    }
  }

  if (!protocolo) {
    return (
      <Tela
        onVoltar={() => nav("/")}
        rodape={
          <Button className="w-full" onClick={buscar}>
            <Search className="w-4 h-4" />
            Consultar
          </Button>
        }
      >
        <TituloTela>Consultar meu relato</TituloTela>

        <label className="text-sm font-semibold text-oliva mb-1.5 block">Código do protocolo</label>
        <input
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          placeholder="CE-2026-XXXX-XXXX"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="campo w-full rounded-xl border border-linha bg-papel p-3 font-mono text-base text-oliva focus:outline-none"
        />
        <p className="text-xs text-ink-2 mt-2">
          O código foi mostrado uma única vez, ao final do relato.
        </p>
      </Tela>
    );
  }

  return (
    <Tela
      onVoltar={() => {
        setProtocolo("");
        setEntrada("");
      }}
    >
      <h1 className="font-mono text-lg font-semibold tracking-wide text-ink mb-4">{protocolo}</h1>

      {consulta.isLoading && (
        <div className="grid place-items-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-seal" />
        </div>
      )}

      {!consulta.isLoading && !consulta.data && (
        <div className="rounded-xl border border-line-2 bg-card p-5 text-sm text-ink-2">
          Protocolo não encontrado. Verifique se digitou exatamente como recebeu: maiúsculas,
          números e hífens. Por segurança, não informamos se um código existe ou não.
        </div>
      )}

      {consulta.data && <ConsultaStatus protocolo={protocolo} dados={consulta.data} />}
    </Tela>
  );
}

function ConsultaStatus({
  protocolo,
  dados,
}: {
  protocolo: string;
  dados: NonNullable<ReturnType<typeof useConsultaCaso>["data"]>;
}) {
  const [msg, setMsg] = useState("");
  const [avaliacao, setAvaliacao] = useState<AvaliacaoEncerramento | null>(null);
  const [comentario, setComentario] = useState("");
  const enviar = useEnviarMensagemAnonima(protocolo);
  const pesquisa = useResponderPesquisa(protocolo);

  async function enviarMsg() {
    if (!msg.trim()) return;
    try {
      await enviar.mutateAsync(msg.trim());
      setMsg("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar.");
    }
  }

  async function enviarPesquisa() {
    if (!avaliacao) return;
    try {
      await pesquisa.mutateAsync({ avaliacao, comentario });
      toast.success("Avaliação enviada. Obrigada.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar a avaliação.");
    }
  }

  return (
    <>
      <Timeline status={dados.status} />

      <Eyebrow n="01">Conversa com a equipe</Eyebrow>
      <div className="mt-2 space-y-2">
        {dados.mensagens.length === 0 && (
          <p className="text-sm text-ink-2">
            Ainda não há mensagens. Se você marcou "quero retorno", a equipe responde por aqui.
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
            {m.conteudo}
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
          Este caso está encerrado e não aceita novas mensagens.
        </p>
      )}

      {dados.pesquisaRespondida && (
        <div className="mt-5 border-l-2 border-seal pl-4 py-1 text-sm text-ink-2">
          Obrigada, sua avaliação sobre este caso já foi registrada.
        </div>
      )}

      {dados.pesquisaLiberada && !dados.pesquisaRespondida && (
        <div className="mt-6 border-t border-line pt-4">
          <Eyebrow n="02">Antes de sair, como foi essa experiência?</Eyebrow>
          <div className="flex gap-2 mt-3">
            {OPCOES_PESQUISA.map((o) => (
              <button
                key={o.v}
                onClick={() => setAvaliacao(o.v)}
                className={cn(
                  "flex-1 rounded-xl border p-3 text-center transition-[color,background-color,border-color,transform] duration-200 ease-smooth active:scale-[0.98]",
                  avaliacao === o.v ? "border-seal bg-seal-tint" : "border-line-2 bg-card",
                )}
              >
                <div className="text-xl">{o.emoji}</div>
                <div className="text-[0.62rem] mt-1 text-ink-2 leading-tight">{o.rot}</div>
              </button>
            ))}
          </div>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Quer deixar um comentário final? (opcional, também anônimo)"
            className="w-full min-h-[64px] mt-3 rounded-xl border border-input bg-card p-2.5 text-sm text-ink resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            className="w-full mt-3"
            onClick={enviarPesquisa}
            disabled={!avaliacao || pesquisa.isPending}
          >
            {pesquisa.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar avaliação
          </Button>
        </div>
      )}
    </>
  );
}
