import { useNavigate } from "react-router-dom";
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
      <div className="stagger grid grid-cols-2 gap-2.5">
        {lista.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoria(c.id)}
            className={cn(
              "rounded-xl border p-3 text-sm font-semibold leading-tight text-center transition-[color,background-color,border-color,transform] duration-200 ease-smooth active:scale-[0.98]",
              categoria === c.id
                ? "border-seal bg-seal-tint text-seal"
                : "border-line-2 bg-card text-ink-2 hover:border-seal-line",
            )}
          >
            {c.rotulo}
          </button>
        ))}
      </div>
    </Tela>
  );
}
