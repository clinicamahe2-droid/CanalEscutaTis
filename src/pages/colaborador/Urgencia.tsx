import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { cn } from "@/lib/utils";
import { useRelato } from "@/fluxo/RelatoContext";

export default function Urgencia() {
  const nav = useNavigate();
  const { categoria, urgencia, setUrgencia } = useRelato();

  useEffect(() => {
    if (!categoria) nav("/relatar/categoria", { replace: true });
  }, [categoria, nav]);

  return (
    <Tela
      titulo="Isso está acontecendo agora?"
      onVoltar={() => nav("/relatar/categoria")}
      passo={2}
      rodape={
        <Button className="w-full" disabled={!urgencia} onClick={() => nav("/relatar/relato")}>
          Continuar
        </Button>
      }
    >
      <div className="space-y-3">
        {/* Selecionar "urgente" e o unico outro ponto (alem do link abaixo) onde
            `signal` aparece nesta tela — e o momento em que a pessoa declara
            risco real, nao uma caixa de alarme separada (ver DECISOES.md). */}
        <button
          onClick={() => setUrgencia("alta")}
          className={cn(
            "w-full text-left rounded-xl border p-4 transition-[color,background-color,border-color,transform] duration-200 ease-smooth active:scale-[0.98]",
            urgencia === "alta"
              ? "border-signal bg-signal-tint"
              : "border-line-2 bg-card hover:border-seal-line",
          )}
        >
          <div className="font-semibold text-sm text-ink">É urgente, risco imediato</div>
          <div className="text-xs text-ink-2 mt-0.5">
            Algo está acontecendo agora ou pode se repetir hoje
          </div>
        </button>
        <button
          onClick={() => setUrgencia("baixa")}
          className={cn(
            "w-full text-left rounded-xl border p-4 transition-[color,background-color,border-color,transform] duration-200 ease-smooth active:scale-[0.98]",
            urgencia === "baixa"
              ? "border-seal bg-seal-tint"
              : "border-line-2 bg-card hover:border-seal-line",
          )}
        >
          <div className="font-semibold text-sm text-ink">Não é urgente, mas quero registrar</div>
          <div className="text-xs text-ink-2 mt-0.5">
            Aconteceu, mas não há risco imediato
          </div>
        </button>
      </div>

      <p className="mt-4 text-xs text-ink-2">
        Precisa falar com alguém agora?{" "}
        <Link to="/apoio" className="text-signal font-semibold underline underline-offset-2">
          Ver contatos de apoio
        </Link>
      </p>
    </Tela>
  );
}
