import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        <button
          onClick={() => setUrgencia("alta")}
          className={cn(
            "w-full text-left rounded-xl border p-4 transition-colors",
            urgencia === "alta" ? "border-primary bg-primary-soft" : "border-border bg-card",
          )}
        >
          <div className="font-semibold text-sm">É urgente, risco imediato</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Algo está acontecendo agora ou pode se repetir hoje
          </div>
        </button>
        <button
          onClick={() => setUrgencia("baixa")}
          className={cn(
            "w-full text-left rounded-xl border p-4 transition-colors",
            urgencia === "baixa" ? "border-primary bg-primary-soft" : "border-border bg-card",
          )}
        >
          <div className="font-semibold text-sm">Não é urgente, mas quero registrar</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Aconteceu, mas não há risco imediato
          </div>
        </button>

        {urgencia === "alta" && (
          <div className="rounded-xl bg-critical-soft text-critical p-4 text-sm animate-fade-in">
            <b className="block mb-1">Se o risco é agora, não espere o canal responder.</b>
            Ligue 188 (CVV) ou 100 (Direitos Humanos) enquanto isso. Você ainda pode continuar o
            relato depois.
          </div>
        )}
      </div>
    </Tela>
  );
}
