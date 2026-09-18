import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela, TituloTela } from "@/components/colaborador/Tela";
import { Broto } from "@/components/Broto";
import { CartaoCodigo } from "@/components/colaborador/CartaoCodigo";
import { useCriarSolicitacaoAtendimento } from "@/hooks/dados";
import { toast } from "sonner";

/**
 * Pedido de Atendimento Psicológico — DELIBERADAMENTE fora do RelatoContext:
 * aqui a pessoa se identifica porque quer ser procurada (ver DECISOES.md,
 * 2026-09-08). Estado local só desta tela, nunca entra no rascunho do relato
 * anônimo. Ao enviar, recebe um código `AP-...` próprio para ler a resposta
 * da equipe (ver DECISOES.md, 2026-09-18).
 */
export default function AtendimentoPsicologico() {
  const nav = useNavigate();
  const [nome, setNome] = useState("");
  const [setor, setSetor] = useState("");
  const [necessidade, setNecessidade] = useState("");
  const [codigo, setCodigo] = useState<string | null>(null);
  const criar = useCriarSolicitacaoAtendimento();

  const valido = nome.trim().length >= 2 && setor.trim().length >= 2 && necessidade.trim().length >= 10;

  async function enviar() {
    try {
      const r = await criar.mutateAsync({ nome, setor, necessidade });
      setCodigo(r.codigo);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar. Tente de novo.");
    }
  }

  if (codigo) {
    return (
      <Tela
        semAnimacao
        rodape={
          <div className="space-y-2">
            <Button className="w-full" onClick={() => nav("/consulta", { state: { codigo } })}>
              Acompanhar minha conversa
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => nav("/", { replace: true })}>
              Voltar ao início
            </Button>
          </div>
        }
      >
        <div className="pt-2.5 pb-5">
          <Broto size={30} className="mb-3.5 text-oliva" />
          <h1 className="text-[1.85rem] font-display font-medium leading-[1.1] text-ink mb-3.5">
            Recebemos o seu pedido.
          </h1>
          <p className="max-w-[34ch] text-[0.95rem] text-texto">
            Obrigada por pedir ajuda, {nome.trim().split(" ")[0]}. A equipe responde por aqui, e você
            lê a resposta usando o código abaixo.
          </p>
        </div>

        <CartaoCodigo rotulo="Seu código de acompanhamento" codigo={codigo} />

        <div className="guarde mt-3.5">
          <i />
          <p className="text-[0.84rem] text-texto">
            <b className="text-oliva font-semibold">Guarde este código.</b> Na tela inicial, toque em
            "Já contei, quero saber como está" e digite o código pra ver a resposta e escrever de
            volta. Se perder, é só enviar um novo pedido.
          </p>
        </div>
      </Tela>
    );
  }

  return (
    <Tela
      onVoltar={() => nav(-1)}
      rodape={
        <Button className="w-full" disabled={!valido || criar.isPending} onClick={enviar}>
          {criar.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {criar.isPending ? "Enviando…" : "Enviar pedido"}
        </Button>
      }
    >
      <TituloTela>Atendimento Psicológico</TituloTela>
      <p className="text-sm text-texto mb-5">
        Diferente do relato, aqui você se identifica: são esses dados que a equipe usa pra te
        responder. Nada disso vai junto com relatos anônimos.
      </p>

      <label className="text-sm font-semibold text-oliva mb-1.5 block">Nome</label>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Seu nome"
        className="campo w-full rounded-xl border border-linha bg-papel p-3 text-sm text-oliva focus:outline-none"
      />

      <label className="text-sm font-semibold text-oliva mb-1.5 mt-4 block">Setor</label>
      <input
        value={setor}
        onChange={(e) => setSetor(e.target.value)}
        placeholder="Onde você trabalha"
        className="campo w-full rounded-xl border border-linha bg-papel p-3 text-sm text-oliva focus:outline-none"
      />

      <label className="text-sm font-semibold text-oliva mb-1.5 mt-4 block">
        Descreva sua necessidade
      </label>
      <textarea
        value={necessidade}
        onChange={(e) => setNecessidade(e.target.value)}
        placeholder="Conte um pouco do que você está precisando…"
        className="campo w-full min-h-[120px] rounded-xl border border-linha bg-papel p-3 text-sm text-oliva resize-y focus:outline-none"
      />

      <p className="text-xs text-salvia mt-3 leading-snug">
        A resposta da equipe chega aqui, dentro do app: ao enviar, você recebe um código pra ler a
        resposta e escrever de volta. Não precisa deixar telefone nem e-mail.
      </p>
    </Tela>
  );
}
