import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { CategoriaId, RascunhoRelato, Urgencia } from "@/dominio/tipos";
import { removerAnexoBlob } from "@/data/anexosDb";

interface RelatoState {
  categoria: CategoriaId | null;
  urgencia: Urgencia | null;
  relato: string;
  quer_retorno: boolean;
  anexo: RascunhoRelato["anexo"];
  protocoloGerado: string | null;
}

interface RelatoContextType extends RelatoState {
  setCategoria: (c: CategoriaId) => void;
  setUrgencia: (u: Urgencia) => void;
  setRelato: (t: string) => void;
  setQuerRetorno: (v: boolean) => void;
  setAnexo: (a: RascunhoRelato["anexo"]) => void;
  setProtocoloGerado: (p: string) => void;
  montarRascunho: () => RascunhoRelato;
  reiniciar: () => void;
}

const estadoInicial: RelatoState = {
  categoria: null,
  urgencia: null,
  relato: "",
  quer_retorno: true,
  anexo: null,
  protocoloGerado: null,
};

const Ctx = createContext<RelatoContextType | undefined>(undefined);

export function RelatoProvider({ children }: { children: ReactNode }) {
  const [st, setSt] = useState<RelatoState>(estadoInicial);
  const anexoRef = useRef<string | null>(null);

  const valor = useMemo<RelatoContextType>(() => {
    const patch = (p: Partial<RelatoState>) => setSt((s) => ({ ...s, ...p }));
    return {
      ...st,
      setCategoria: (categoria) => patch({ categoria }),
      setUrgencia: (urgencia) => patch({ urgencia }),
      setRelato: (relato) => patch({ relato }),
      setQuerRetorno: (quer_retorno) => patch({ quer_retorno }),
      setAnexo: (anexo) => {
        // troca de anexo: descarta o blob anterior do IndexedDB
        if (anexoRef.current && anexoRef.current !== anexo?.ref) {
          void removerAnexoBlob(anexoRef.current);
        }
        anexoRef.current = anexo?.ref ?? null;
        patch({ anexo });
      },
      setProtocoloGerado: (protocoloGerado) => patch({ protocoloGerado }),
      montarRascunho: () => ({
        categoria: st.categoria,
        urgencia: st.urgencia,
        relato: st.relato,
        quer_retorno: st.quer_retorno,
        anexo: st.anexo,
      }),
      reiniciar: () => {
        anexoRef.current = null;
        setSt(estadoInicial);
      },
    };
  }, [st]);

  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useRelato(): RelatoContextType {
  const c = useContext(Ctx);
  if (!c) throw new Error("useRelato precisa estar dentro de <RelatoProvider>");
  return c;
}
