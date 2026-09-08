import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  HeartHandshake,
  FileBarChart,
  BellRing,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LogoTIS } from "@/components/LogoTIS";
import { useAuth } from "@/contexts/AuthContext";
import { useDadosPainel, useSolicitacoes } from "@/hooks/dados";
import { situacaoSla } from "@/dominio/sla";

type Contagens = { atrasados: number; novasSolicitacoes: number };

const ITENS: {
  to: string;
  fim: boolean;
  rot: string;
  icone: typeof LayoutDashboard;
  badge?: keyof Contagens;
}[] = [
  { to: "/painel", fim: true, rot: "Visão Geral", icone: LayoutDashboard },
  { to: "/painel/casos", fim: false, rot: "Caixa de Casos", icone: Inbox, badge: "atrasados" },
  {
    to: "/painel/atendimentos",
    fim: false,
    rot: "Atendimento",
    icone: HeartHandshake,
    badge: "novasSolicitacoes",
  },
  { to: "/painel/relatorios", fim: false, rot: "Relatórios", icone: FileBarChart },
  { to: "/painel/alertas", fim: false, rot: "Alertas", icone: BellRing },
  { to: "/painel/config", fim: false, rot: "Configurações", icone: Settings },
];

function Navegacao({
  atrasados,
  novasSolicitacoes,
  aoNavegar,
}: {
  atrasados: number;
  novasSolicitacoes: number;
  aoNavegar?: () => void;
}) {
  const contagens: Contagens = { atrasados, novasSolicitacoes };
  const { sessao, sair } = useAuth();
  const nav = useNavigate();
  return (
    <div className="flex flex-col h-full">
      <div className="px-2 pb-4">
        <div className="font-display font-semibold text-primary-dark">Canal de Escuta</div>
        <div className="mt-1.5 flex items-center gap-1.5 text-[0.62rem] font-mono uppercase tracking-wide text-muted-foreground">
          <LogoTIS height={18} />
          <span>TIS</span>
        </div>
      </div>
      <nav className="flex flex-col gap-0.5">
        {ITENS.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.fim}
            onClick={aoNavegar}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/75 hover:bg-secondary",
              )
            }
          >
            <it.icone className="w-4 h-4 shrink-0" />
            <span className="flex-1">{it.rot}</span>
            {it.badge && contagens[it.badge] > 0 && (
              <span className="rounded-full bg-critical text-white text-[0.62rem] font-mono px-1.5 py-0.5">
                {contagens[it.badge]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <div className="px-2 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground">{sessao?.nome}</div>
          <div>{sessao?.crp ? `${sessao.crp} · ` : ""}{sessao?.papel}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start text-muted-foreground"
          onClick={async () => {
            await sair();
            nav("/equipe/entrar", { replace: true });
          }}
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}

export default function PainelLayout() {
  const [aberto, setAberto] = useState(false);
  const { data } = useDadosPainel();
  const { data: solicitacoes } = useSolicitacoes();
  const atrasados = (data?.casos ?? []).filter(
    (c) => situacaoSla(c.sla_prazo, c.status).vencido,
  ).length;
  const novasSolicitacoes = (solicitacoes ?? []).filter((s) => s.status === "nova").length;

  return (
    <div className="min-h-[100dvh] bg-background md:grid md:grid-cols-[232px_1fr]">
      {/* sidebar desktop */}
      <aside className="hidden md:flex flex-col bg-card border-r border-border p-4">
        <Navegacao atrasados={atrasados} novasSolicitacoes={novasSolicitacoes} />
      </aside>

      {/* topbar mobile */}
      <div className="md:hidden flex items-center gap-3 border-b border-border bg-card px-4 py-3 safe-t">
        <Sheet open={aberto} onOpenChange={setAberto}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-card p-4">
            <Navegacao
              atrasados={atrasados}
              novasSolicitacoes={novasSolicitacoes}
              aoNavegar={() => setAberto(false)}
            />
          </SheetContent>
        </Sheet>
        <span className="font-display font-semibold text-primary-dark">Canal de Escuta</span>
      </div>

      <main className="min-w-0 p-5 sm:p-7 max-w-5xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
