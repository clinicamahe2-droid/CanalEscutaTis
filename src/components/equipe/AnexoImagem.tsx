import { useEffect, useState } from "react";
import { getProvider } from "@/data";
import type { Anexo } from "@/dominio/tipos";

export function AnexoImagem({ anexo }: { anexo: Anexo }) {
  const [url, setUrl] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let vivo = true;
    let criada: string | null = null;
    (async () => {
      try {
        const p = await getProvider();
        const u = await p.getAnexoUrl(anexo);
        if (!vivo) return;
        if (u) {
          criada = u;
          setUrl(u);
        } else setErro(true);
      } catch {
        if (vivo) setErro(true);
      }
    })();
    return () => {
      vivo = false;
      if (criada && criada.startsWith("blob:")) URL.revokeObjectURL(criada);
    };
  }, [anexo]);

  if (erro) {
    return (
      <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
        {anexo.nome} — pré-visualização indisponível ({Math.round(anexo.tamanho / 1024)} KB)
      </div>
    );
  }
  if (!url) {
    return <div className="rounded-lg border border-border bg-surface2 h-32 animate-pulse" />;
  }
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block">
      <img
        src={url}
        alt={`Anexo ${anexo.nome}`}
        className="rounded-lg border border-border max-h-64 w-auto"
      />
    </a>
  );
}
