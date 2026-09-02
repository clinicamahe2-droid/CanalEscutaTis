import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { MODO_DADOS } from "@/data";
import { ler, gravar, remover } from "@/data/armazenamento";

export interface SessaoEquipe {
  nome: string;
  email: string;
  papel: string;
  crp: string | null;
}

interface AuthContextType {
  sessao: SessaoEquipe | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<{ erro: string | null }>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CHAVE_SESSAO = "sessao";

/**
 * Usuarios de demonstracao — MODO LOCAL apenas. Sao credenciais de vitrine, nao
 * de seguranca; por isso ficam impressas na propria tela de login. No modo
 * supabase o login real e via Supabase Auth restrito a `equipe_clinica`.
 */
export const USUARIOS_DEMO: Array<SessaoEquipe & { senha: string }> = [
  {
    nome: "Márcia Bússolo",
    email: "marcia@escuta.demo",
    senha: "escuta2026",
    papel: "Psicóloga · Equipe de Escuta",
    crp: "CRP 02959",
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<SessaoEquipe | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    async function iniciar() {
      if (MODO_DADOS === "supabase") {
        try {
          const { getSupabase } = await import("@/integrations/supabase/client");
          const sb = getSupabase();
          const { data } = await sb.auth.getSession();
          if (!ativo) return;
          const u = data.session?.user;
          setSessao(
            u
              ? {
                  nome: (u.user_metadata?.nome as string) || u.email || "Equipe",
                  email: u.email || "",
                  papel: "Equipe de Escuta",
                  crp: (u.user_metadata?.crp as string) ?? null,
                }
              : null,
          );
          sb.auth.onAuthStateChange((_e, s) => {
            const uu = s?.user;
            setSessao(
              uu
                ? {
                    nome: (uu.user_metadata?.nome as string) || uu.email || "Equipe",
                    email: uu.email || "",
                    papel: "Equipe de Escuta",
                    crp: (uu.user_metadata?.crp as string) ?? null,
                  }
                : null,
            );
          });
        } catch {
          setSessao(null);
        } finally {
          if (ativo) setCarregando(false);
        }
        return;
      }
      // modo local
      const s = ler<SessaoEquipe | null>(CHAVE_SESSAO, null);
      if (ativo) {
        setSessao(s && s.email ? s : null);
        setCarregando(false);
      }
    }
    iniciar();
    return () => {
      ativo = false;
    };
  }, []);

  const valor = useMemo<AuthContextType>(
    () => ({
      sessao,
      carregando,
      async entrar(email, senha) {
        const e = email.trim().toLowerCase();
        if (MODO_DADOS === "supabase") {
          try {
            const { getSupabase } = await import("@/integrations/supabase/client");
            const { error } = await getSupabase().auth.signInWithPassword({ email: e, password: senha });
            return { erro: error ? "E-mail ou senha inválidos." : null };
          } catch {
            return { erro: "Não foi possível conectar ao servidor." };
          }
        }
        const achado = USUARIOS_DEMO.find((u) => u.email === e && u.senha === senha);
        if (!achado) return { erro: "E-mail ou senha inválidos." };
        const nova: SessaoEquipe = {
          nome: achado.nome,
          email: achado.email,
          papel: achado.papel,
          crp: achado.crp,
        };
        gravar(CHAVE_SESSAO, nova);
        setSessao(nova);
        return { erro: null };
      },
      async sair() {
        if (MODO_DADOS === "supabase") {
          try {
            const { getSupabase } = await import("@/integrations/supabase/client");
            await getSupabase().auth.signOut();
          } catch {
            /* noop */
          }
        }
        remover(CHAVE_SESSAO);
        setSessao(null);
      },
    }),
    [sessao, carregando],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
