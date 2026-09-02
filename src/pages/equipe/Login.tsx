import { useState } from "react";
import { useLocation, useNavigate, Navigate, Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, USUARIOS_DEMO } from "@/contexts/AuthContext";
import { LogoTIS } from "@/components/LogoTIS";
import { MODO_DADOS } from "@/data";

export default function Login() {
  const { sessao, carregando, entrar } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const destino = (loc.state as { de?: string } | null)?.de || "/painel";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!carregando && sessao) return <Navigate to={destino} replace />;

  async function submeter(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const { erro } = await entrar(email, senha);
    setEnviando(false);
    if (erro) setErro(erro);
    else nav(destino, { replace: true });
  }

  return (
    <div className="min-h-[100dvh] grid place-items-center bg-background px-5">
      <div className="w-full max-w-sm">
        <LogoTIS height={28} className="mb-4" />
        <div className="text-2xl font-display font-semibold text-primary-dark">Canal de Escuta</div>
        <p className="text-sm text-muted-foreground mb-6">Painel da equipe de escuta · TIS</p>

        <form onSubmit={submeter} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          {erro && <p className="text-sm text-critical">{erro}</p>}

          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar
          </Button>
        </form>

        {MODO_DADOS === "local" && (
          <div className="mt-6 rounded-xl border border-border bg-surface2 p-3 text-xs text-muted-foreground">
            <div className="font-semibold text-foreground mb-1">Acesso de demonstração</div>
            {USUARIOS_DEMO.map((u) => (
              <div key={u.email} className="font-mono">
                {u.email} · {u.senha}
              </div>
            ))}
          </div>
        )}

        <Link
          to="/"
          className="mt-6 block text-center text-xs text-muted-foreground hover:text-foreground"
        >
          ← Voltar para o canal público
        </Link>
      </div>
    </div>
  );
}
