import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * Enquanto a sessao carrega NAO redirecionamos — so mostramos carregando.
 * Redirecionar cedo faz o F5 dentro do painel cair no login (bug classico).
 */
export function RotaProtegida({ children }: { children: ReactNode }) {
  const { sessao, carregando } = useAuth();
  const local = useLocation();

  if (carregando) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!sessao) {
    return <Navigate to="/equipe/entrar" replace state={{ de: local.pathname }} />;
  }
  return <>{children}</>;
}
