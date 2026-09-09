import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Paperclip, Check, X, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tela, TituloTela } from "@/components/colaborador/Tela";
import { rotuloCategoria } from "@/dominio/categorias";
import { useRelato } from "@/fluxo/RelatoContext";
import { useConfigPublica } from "@/hooks/dados";
import { sanitizarAnexoImagem, AnexoInvalidoError, TIPOS_ACEITOS } from "@/lib/anexoImagem";
import { gerarRefAnexo, salvarAnexoBlob } from "@/data/anexosDb";
import { toast } from "sonner";

const MIN_RELATO = 10;

export default function Relato() {
  const nav = useNavigate();
  const { categoria, urgencia, relato, setRelato, anexo, setAnexo } = useRelato();
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
      onVoltar={() => nav("/relatar/urgencia")}
      passo={3}
      rodape={
        <Button className="w-full" disabled={curto} onClick={() => nav("/relatar/revisao")}>
          Revisar
        </Button>
      }
    >
      <TituloTela>Conte o que aconteceu</TituloTela>

      {categoria && (
        <div className="contexto flex items-center gap-2 flex-wrap mb-4 text-[0.81rem] text-salvia">
          <span className="chip">
            <i />
            {rotuloCategoria(categoria)}
          </span>
          {urgencia && <span>· {urgencia === "alta" ? "urgente" : "não é urgente"}</span>}
          <button
            type="button"
            onClick={() => nav("/relatar/categoria")}
            className="text-salvia underline underline-offset-[3px] decoration-line-2"
          >
            mudar
          </button>
        </div>
      )}

      <div className="rotulo flex items-baseline justify-between gap-2.5 mb-2">
        <b className="text-sm font-semibold text-oliva">Seu relato</b>
        <span className="text-xs text-salvia">Do seu jeito, não precisa ser perfeito.</span>
      </div>
      <textarea
        value={relato}
        onChange={(e) => setRelato(e.target.value)}
        placeholder="Descreva com o máximo de detalhes que puder: quando, onde, quem esteve envolvido…"
        className="campo w-full min-h-[190px] rounded-xl border border-linha bg-papel p-4 text-sm leading-relaxed text-oliva resize-y focus:outline-none"
      />
      <p className="text-xs text-salvia-2 mt-1.5 px-0.5">
        {curto ? `Escreva ao menos ${MIN_RELATO} caracteres.` : "Sem limite de tamanho"}
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
            <div className="flex items-center gap-2 rounded-xl border border-linha-2 bg-bege text-oliva p-3 text-sm">
              <Check className="w-4 h-4 shrink-0 text-oliva" />
              <span className="flex-1">1 imagem anexada ({Math.round(anexo.tamanho / 1024)} KB)</span>
              <button aria-label="Remover anexo" onClick={() => setAnexo(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={processando}
              className="anexo flex w-full items-center gap-2.5 rounded-[14px] p-[13px_15px] text-sm font-medium text-salvia"
            >
              {processando ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
              {processando ? "Processando imagem…" : "Anexar print ou foto (opcional)"}
            </button>
          )}
          {/* Aviso de privacidade — nunca `risco` aqui (reservado a Urgencia +
              link de apoio, ver DECISOES.md Bloco 4-d). A enfase e tipografica. */}
          <p className="flex gap-2 items-start mt-2.5 px-0.5 text-[0.78rem] leading-snug text-salvia">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5 text-salvia-2" />
            A imagem sai do seu aparelho sem data, local ou modelo do celular. Antes de enviar,
            confira se crachás, nomes ou rostos aparecem.
          </p>
        </div>
      )}
    </Tela>
  );
}
