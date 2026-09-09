import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Copy, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { Broto } from "@/components/Broto";
import { useRelato } from "@/fluxo/RelatoContext";
import { toast } from "sonner";

export default function Protocolo() {
  const nav = useNavigate();
  const { protocoloGerado, reiniciar } = useRelato();
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!protocoloGerado) nav("/", { replace: true });
  }, [protocoloGerado, nav]);

  if (!protocoloGerado) return null;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(protocoloGerado!);
      setCopiado(true);
      toast.success("Protocolo copiado.");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      toast.error("Não foi possível copiar. Anote o código manualmente.");
    }
  }

  return (
    <Tela
      semAnimacao
      rodape={
        <Button
          variant="secondary"
          className="w-full justify-start gap-2.5"
          onClick={() => {
            reiniciar();
            nav("/", { replace: true });
          }}
        >
          ← Voltar ao início
        </Button>
      }
    >
      <div className="pt-2.5 pb-5">
        <Broto size={30} className="mb-3.5 text-oliva" />
        <h1 className="text-[1.85rem] font-display font-medium leading-[1.1] text-ink mb-3.5">
          Recebemos o seu relato.
        </h1>
        <p className="max-w-[34ch] text-[0.95rem] text-texto">
          Obrigada por confiar. Ele já está com a equipe de escuta e vai ser lido com cuidado, sem
          pressa e sem julgamento.
        </p>
      </div>

      <div className="rounded-[18px] bg-bege p-[18px_18px_16px] shadow-[var(--sombra-quente)]">
        <div className="text-[0.78rem] font-medium text-salvia mb-2.5">Seu protocolo</div>
        <span className="codigo font-mono font-semibold text-[1.4rem] tracking-wide text-oliva break-all">
          {protocoloGerado}
        </span>
        <div className="mt-3.5">
          <button
            onClick={copiar}
            className="btn-oco inline-flex items-center gap-2 rounded-xl px-4 py-[11px] text-sm font-semibold"
          >
            {copiado ? <Check className="w-[15px] h-[15px]" /> : <Copy className="w-[15px] h-[15px]" />}
            {copiado ? "Copiado" : "Copiar código"}
          </button>
        </div>
      </div>

      <div className="guarde mt-3.5">
        <i />
        <p className="text-[0.84rem] text-texto">
          <b className="text-oliva font-semibold">Guarde este código agora.</b> É a única forma de
          acompanhar seu caso. Não pedimos e-mail nem login, e não há como recuperá-lo depois.
        </p>
      </div>

      <div className="agora mt-6">
        <h3 className="text-[1.19rem] font-display font-medium text-ink mb-3">O que acontece agora</h3>
        <div className="linha-t">
          <div className="etapa ok">
            <div className="pt">
              <Check />
            </div>
            <div>
              <b className="block text-sm font-semibold text-oliva leading-tight mt-px">Recebido</b>
              <span className="block text-xs text-salvia mt-0.5">Hoje, agora há pouco</span>
            </div>
          </div>
          <div className="etapa futuro">
            <div className="pt" />
            <div>
              <b className="block text-sm font-semibold text-oliva leading-tight mt-px">Em triagem</b>
              <span className="block text-xs text-salvia mt-0.5">
                A equipe lê e entende o que você contou
              </span>
            </div>
          </div>
          <div className="etapa futuro">
            <div className="pt" />
            <div>
              <b className="block text-sm font-semibold text-oliva leading-tight mt-px">Retorno</b>
              <span className="block text-xs text-salvia mt-0.5">
                Você acompanha pelo código, quando quiser
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="aside-apoio mt-6 rounded-2xl p-[16px_18px]">
        <p className="text-[0.84rem] text-texto">
          Se estiver difícil agora, você não precisa esperar o retorno.
        </p>
        <div className="flex flex-col gap-1.5 mt-2.5">
          <Link to="/apoio" className="inline-flex items-center gap-1.5 text-sm font-semibold text-oliva">
            <Phone className="w-3.5 h-3.5" />
            Ver contatos de apoio
          </Link>
          <Link to="/atendimento" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ouro">
            Pedir atendimento psicológico
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </Tela>
  );
}
