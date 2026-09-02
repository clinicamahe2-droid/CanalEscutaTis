import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, Check, X, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela } from "@/components/colaborador/Tela";
import { rotuloCategoria } from "@/dominio/categorias";
import { useRelato } from "@/fluxo/RelatoContext";
import { useConfigPublica } from "@/hooks/dados";
import { sanitizarAnexoImagem, AnexoInvalidoError, TIPOS_ACEITOS } from "@/lib/anexoImagem";
import { gerarRefAnexo, salvarAnexoBlob } from "@/data/anexosDb";
import { toast } from "sonner";

const MIN_RELATO = 10;

export default function Relato() {
  const nav = useNavigate();
  const { categoria, relato, setRelato, anexo, setAnexo } = useRelato();
  const { data: config } = useConfigPublica();
  const inputRef = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (!categoria) nav("/relatar/categoria", { replace: true });
  }, [categoria, nav]);

  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setProcessando(true);
    try {
      const san = await sanitizarAnexoImagem(file);
      const ref = gerarRefAnexo();
      await salvarAnexoBlob(ref, san.blob);
      setAnexo({ nome: san.nome, tipo: san.tipo, tamanho: san.tamanho, ref });
      toast.success("Imagem anexada. Metadados removidos.");
    } catch (err) {
      const msg =
        err instanceof AnexoInvalidoError
          ? err.message
          : "Não foi possível processar a imagem.";
      toast.error(msg);
    } finally {
      setProcessando(false);
    }
  }

  const curto = relato.trim().length < MIN_RELATO;

  return (
    <Tela
      titulo="Conte o que aconteceu"
      onVoltar={() => nav("/relatar/urgencia")}
      passo={3}
      rodape={
        <Button className="w-full" disabled={curto} onClick={() => nav("/relatar/revisao")}>
          Revisar
        </Button>
      }
    >
      {categoria && (
        <span className="inline-block self-start rounded-full bg-primary-soft text-primary-dark text-xs font-semibold px-3 py-1 mb-3">
          {rotuloCategoria(categoria)}
        </span>
      )}

      <label className="text-xs uppercase tracking-wide text-muted-foreground font-mono mb-1.5 block">
        Descrição
      </label>
      <textarea
        value={relato}
        onChange={(e) => setRelato(e.target.value)}
        placeholder="Descreva com o máximo de detalhes que puder: quando, onde, quem esteve envolvido…"
        className="w-full min-h-[160px] rounded-xl border border-input bg-card p-3 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <p className="text-xs text-muted-foreground mt-1">
        {curto ? `Escreva ao menos ${MIN_RELATO} caracteres.` : " "}
      </p>

      {config?.permitir_anexos !== false && (
        <div className="mt-3">
          <input
            ref={inputRef}
            type="file"
            accept={TIPOS_ACEITOS.join(",")}
            className="hidden"
            onChange={aoEscolherArquivo}
          />
          {anexo ? (
            <div className="flex items-center gap-2 rounded-xl border border-success bg-success-soft text-success p-3 text-sm">
              <Check className="w-4 h-4 shrink-0" />
              <span className="flex-1">1 imagem anexada ({Math.round(anexo.tamanho / 1024)} KB)</span>
              <button aria-label="Remover anexo" onClick={() => setAnexo(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={processando}
              className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground hover:border-primary/50"
            >
              {processando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
              {processando ? "Processando imagem…" : "Anexar print ou foto (opcional)"}
            </button>
          )}
          {anexo && (
            <p className="mt-2 flex gap-1.5 text-xs text-warning">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Revise a imagem antes de enviar — crachás, nomes e rostos podem identificar você.
            </p>
          )}
        </div>
      )}
    </Tela>
  );
}
