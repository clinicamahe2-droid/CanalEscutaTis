import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
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
      titulo="Sobre o que você quer falar?"
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
      <div className="stagger space-y-2.5">
        {lista.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoria(c.id)}
            className={cn(
              "w-full text-left rounded-xl border p-4 transition-[color,background-color,border-color,transform] duration-200 ease-smooth active:scale-[0.98]",
              categoria === c.id
                ? "border-seal bg-seal-tint"
                : "border-line-2 bg-card hover:border-seal-line",
            )}
          >
            <div className={cn("font-semibold text-sm", categoria === c.id ? "text-seal" : "text-ink")}>
              {c.rotulo}
            </div>
            <div className="text-xs text-ink-2 mt-0.5">{c.descricao}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-line">
        <span className="font-mono text-[0.65rem] uppercase tracking-wide text-record">
          Outro caminho
        </span>
        <button
          onClick={() => nav("/atendimento")}
          className="group mt-2.5 w-full text-left rounded-xl border border-stamp/40 bg-stamp-tint p-4 flex items-center gap-3 transition-[color,background-color,border-color,transform] duration-200 ease-smooth hover:border-stamp active:scale-[0.98]"
        >
          <div className="flex-1">
            <div className="font-semibold text-sm text-ink">Atendimento Psicológico</div>
            <div className="text-xs text-ink-2 mt-0.5">
              Aqui você se identifica: precisamos do seu nome pra te procurar.
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stamp shrink-0 transition-transform duration-200 ease-smooth group-hover:translate-x-0.5" />
        </button>
      </div>
    </Tela>
  );
}
