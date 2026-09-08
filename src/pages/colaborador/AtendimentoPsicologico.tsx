import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { Selo } from "@/components/Selo";
import { useCriarSolicitacaoAtendimento } from "@/hooks/dados";
import { toast } from "sonner";

/**
 * Pedido de Atendimento Psicológico — DELIBERADAMENTE fora do RelatoContext
 * e sem protocolo: aqui a pessoa se identifica porque quer ser procurada
 * (ver DECISOES.md, 2026-09-08). Estado local só desta tela, nunca entra no
 * rascunho do relato anônimo.
 */
export default function AtendimentoPsicologico() {
  const nav = useNavigate();
  const [nome, setNome] = useState("");
  const [setor, setSetor] = useState("");
  const [necessidade, setNecessidade] = useState("");
  const [enviado, setEnviado] = useState(false);
  const criar = useCriarSolicitacaoAtendimento();

  const valido = nome.trim().length >= 2 && setor.trim().length >= 2 && necessidade.trim().length >= 10;

  async function enviar() {
    try {
      await criar.mutateAsync({ nome, setor, necessidade });
      setEnviado(true);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar. Tente de novo.");
    }
  }

  if (enviado) {
    return (
      <Tela
        semAnimacao
        className="justify-center text-center"
        rodape={
          <Button variant="secondary" className="w-full" onClick={() => nav("/", { replace: true })}>
            Voltar ao início
          </Button>
        }
      >
        <Selo size={64} className="mx-auto mb-4" />
        <span className="font-mono text-[0.68rem] tracking-wide text-record uppercase">
          Pedido recebido
        </span>
        <h1 className="text-2xl font-display font-medium text-ink mt-1.5 mb-3">
          A equipe vai te procurar
        </h1>
        <p className="text-sm text-ink-2 max-w-[36ch] mx-auto">
          Obrigada por pedir ajuda, {nome.trim().split(" ")[0]}. Alguém da equipe entra em contato
          em breve pelo setor que você informou.
        </p>
      </Tela>
    );
  }

  return (
    <Tela
      titulo="Atendimento Psicológico"
      onVoltar={() => nav(-1)}
      rodape={
        <Button className="w-full" disabled={!valido || criar.isPending} onClick={enviar}>
          {criar.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {criar.isPending ? "Enviando…" : "Enviar pedido"}
        </Button>
      }
    >
      <p className="text-sm text-ink-2 mb-5">
        Diferente do relato, aqui você se identifica: são esses dados que a equipe usa pra te
        procurar. Nada disso vai junto com relatos anônimos.
      </p>

      <label className="text-xs uppercase tracking-wide text-record font-mono mb-1.5 block">
        Nome
      </label>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Seu nome"
        className="w-full rounded border border-input bg-card p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <label className="text-xs uppercase tracking-wide text-record font-mono mb-1.5 mt-4 block">
        Setor
      </label>
      <input
        value={setor}
        onChange={(e) => setSetor(e.target.value)}
        placeholder="Onde você trabalha"
        className="w-full rounded border border-input bg-card p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <label className="text-xs uppercase tracking-wide text-record font-mono mb-1.5 mt-4 block">
        Descreva sua necessidade
      </label>
      <textarea
        value={necessidade}
        onChange={(e) => setNecessidade(e.target.value)}
        placeholder="Conte um pouco do que você está precisando…"
        className="w-full min-h-[120px] rounded-xl border border-input bg-card p-3 text-sm text-ink resize-y focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </Tela>
  );
}
