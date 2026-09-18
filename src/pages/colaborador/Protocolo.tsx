import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { Broto } from "@/components/Broto";
import { CartaoCodigo } from "@/components/colaborador/CartaoCodigo";
import { useRelato } from "@/fluxo/RelatoContext";

export default function Protocolo() {
  const nav = useNavigate();
  const { protocoloGerado, reiniciar } = useRelato();

  useEffect(() => {
    if (!protocoloGerado) nav("/", { replace: true });
  }, [protocoloGerado, nav]);

  if (!protocoloGerado) return null;

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

      <CartaoCodigo rotulo="Seu protocolo" codigo={protocoloGerado} />

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
