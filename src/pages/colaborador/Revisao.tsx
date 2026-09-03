import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tela } from "@/components/colaborador/Tela";
import { rotuloCategoria } from "@/dominio/categorias";
import { useRelato } from "@/fluxo/RelatoContext";
import { useCriarCaso } from "@/hooks/dados";
import { toast } from "sonner";

export default function Revisao() {
  const nav = useNavigate();
  const { categoria, relato, quer_retorno, setQuerRetorno, montarRascunho, setProtocoloGerado } =
    useRelato();
  const criar = useCriarCaso();

  useEffect(() => {
    if (!categoria || relato.trim().length < 10) nav("/relatar/categoria", { replace: true });
  }, [categoria, relato, nav]);

  async function enviar() {
    try {
      const res = await criar.mutateAsync(montarRascunho());
      setProtocoloGerado(res.protocolo);
      nav("/relatar/protocolo", { replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível enviar. Tente de novo.");
    }
  }

  return (
    <Tela
      titulo="Revisar antes de enviar"
      onVoltar={() => nav("/relatar/relato")}
      passo={4}
      rodape={
        <Button className="w-full" onClick={enviar} disabled={criar.isPending}>
          {criar.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {criar.isPending ? "Enviando…" : "Enviar relato"}
        </Button>
      }
    >
      <div className="rounded-xl border border-line-2 bg-paper-2 p-4 mb-3">
        <div className="text-sm font-semibold text-ink">{categoria ? rotuloCategoria(categoria) : "—"}</div>
      </div>
      <div className="rounded-xl border border-line-2 bg-paper-2 p-4 mb-3">
        <div className="text-[0.68rem] font-mono uppercase text-record">Seu relato</div>
        <div className="text-sm text-ink mt-0.5 whitespace-pre-wrap">{relato.trim()}</div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-line-2 p-3 mb-3">
        <span className="text-sm text-ink">Quero receber retorno pelo protocolo</span>
        <Switch checked={quer_retorno} onCheckedChange={setQuerRetorno} />
      </div>

      <div className="border-l-2 border-seal pl-4 py-1 text-sm text-ink-2">
        Nenhum dado que identifique você será salvo junto com este relato.
      </div>
    </Tela>
  );
}
