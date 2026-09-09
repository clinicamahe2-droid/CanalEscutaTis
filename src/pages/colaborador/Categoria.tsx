import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela, TituloTela } from "@/components/colaborador/Tela";
import { cn } from "@/lib/utils";
import { CATEGORIAS } from "@/dominio/categorias";
import { useConfigPublica } from "@/hooks/dados";
import { useRelato } from "@/fluxo/RelatoContext";

export default function Categoria() {
  const nav = useNavigate();
  const { categoria, setCategoria } = useRelato();
  const { data: config } = useConfigPublica();
  const ativas = config?.categorias_ativas;
  const lista = ativas ? CATEGORIAS.filter((c) => ativas.includes(c.id)) : CATEGORIAS;

  return (
    <Tela
      onVoltar={() => nav("/")}
      passo={1}
      rodape={
        <Button
          className="w-full"
          disabled={!categoria}
          onClick={() => nav("/relatar/urgencia")}
        >
          Continuar
        </Button>
      }
    >
      <TituloTela apoio="Escolha o que chega mais perto. A equipe pode ajustar depois.">
        Sobre o que você quer falar?
      </TituloTela>

      <div className="stagger grid grid-cols-2 gap-2.5 mt-1">
        {lista.map((c) => {
          const sel = categoria === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setCategoria(c.id)}
              className={cn(
                "text-left rounded-xl border border-transparent bg-bege p-3.5 transition-[background-color,border-color,transform] duration-150 ease-smooth active:scale-[0.985]",
                sel ? "bg-papel border-oliva shadow-[var(--sombra-quente)]" : "hover:bg-bege-hover",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-[0.87rem] leading-tight text-oliva">
                  {c.rotulo}
                </span>
                {sel && (
                  <span className="grid place-items-center w-5 h-5 rounded-full bg-oliva shrink-0">
                    <Check className="w-3 h-3 text-broto" />
                  </span>
                )}
              </div>
              <div
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-smooth",
                  sel ? "grid-rows-[1fr] mt-1.5" : "grid-rows-[0fr]",
                )}
              >
                <p className="overflow-hidden text-xs text-salvia leading-snug">{c.descricao}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="outro mt-[22px] pt-[18px] border-t border-linha">
        <p className="text-[0.81rem] text-salvia mb-2.5">Se você quer que a equipe te procure:</p>
        <button
          onClick={() => nav("/atendimento")}
          className="opcao ouro flex w-full items-center gap-3 rounded-xl p-3.5"
        >
          <div className="flex-1 text-left">
            <div className="font-semibold text-[0.91rem] text-oliva">Atendimento Psicológico</div>
            <div className="text-xs text-salvia mt-0.5">
              Aqui você se identifica: precisamos do seu nome pra te procurar.
            </div>
          </div>
          <div className="seta">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </button>
      </div>
    </Tela>
  );
}
