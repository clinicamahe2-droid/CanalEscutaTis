import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useDadosPainel } from "@/hooks/dados";
import { CATEGORIAS, rotuloCategoria, ORDEM_GRAVIDADE } from "@/dominio/categorias";
import { situacaoSla } from "@/dominio/sla";
import { PillGravidade, PillStatus } from "@/components/equipe/pills";
import type { Gravidade, StatusCaso } from "@/dominio/tipos";
import { cn } from "@/lib/utils";

const TODOS = "todos";

export default function CaixaDeCasos() {
  const nav = useNavigate();
  const { data, isLoading } = useDadosPainel();
  const [fStatus, setFStatus] = useState(TODOS);
  const [fCategoria, setFCategoria] = useState(TODOS);
  const [fGravidade, setFGravidade] = useState(TODOS);
  const [fSetor, setFSetor] = useState(TODOS);

  const setores = useMemo(() => {
    const s = new Set<string>();
    (data?.casos ?? []).forEach((c) => c.setor && s.add(c.setor));
    return [...s].sort();
  }, [data]);

  const lista = useMemo(() => {
    let cs = (data?.casos ?? []).slice();
    if (fStatus !== TODOS) cs = cs.filter((c) => c.status === fStatus);
    if (fCategoria !== TODOS) cs = cs.filter((c) => c.categoria === fCategoria);
    if (fGravidade !== TODOS) cs = cs.filter((c) => c.gravidade === fGravidade);
    if (fSetor !== TODOS) cs = cs.filter((c) => (c.setor ?? "") === fSetor);
    cs.sort((a, b) => {
      const ab = a.status === "concluido" ? 1 : 0;
      const bb = b.status === "concluido" ? 1 : 0;
      if (ab !== bb) return ab - bb;
      if (ORDEM_GRAVIDADE[a.gravidade] !== ORDEM_GRAVIDADE[b.gravidade])
        return ORDEM_GRAVIDADE[a.gravidade] - ORDEM_GRAVIDADE[b.gravidade];
      return b.criado_em.localeCompare(a.criado_em);
    });
    return cs;
  }, [data, fStatus, fCategoria, fGravidade, fSetor]);

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const abertos = (data?.casos ?? []).filter((c) => c.status !== "concluido").length;

  return (
    <div className="animate-fade-in">
      <header className="mb-4">
        <h1 className="text-xl font-display font-semibold">Caixa de Casos</h1>
        <p className="text-sm text-muted-foreground">{abertos} abertos · {data?.casos.length ?? 0} no total</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        <Sel value={fStatus} onChange={setFStatus} label="Status">
          <option value={TODOS}>Status: todos</option>
          {(["recebido", "triagem", "em_andamento", "encaminhado", "concluido"] as StatusCaso[]).map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </Sel>
        <Sel value={fCategoria} onChange={setFCategoria} label="Categoria">
          <option value={TODOS}>Categoria: todas</option>
          {CATEGORIAS.map((c) => (
            <option key={c.id} value={c.id}>{c.rotulo}</option>
          ))}
        </Sel>
        <Sel value={fGravidade} onChange={setFGravidade} label="Gravidade">
          <option value={TODOS}>Gravidade: todas</option>
          {(["critica", "media", "baixa"] as Gravidade[]).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </Sel>
        <Sel value={fSetor} onChange={setFSetor} label="Setor">
          <option value={TODOS}>Setor: todos</option>
          {setores.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Sel>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface2 text-[0.62rem] font-mono uppercase tracking-wide text-muted-foreground">
                <th className="text-left px-4 py-2.5">Protocolo</th>
                <th className="text-left px-4 py-2.5">Categoria</th>
                <th className="text-left px-4 py-2.5">Gravidade</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-left px-4 py-2.5 whitespace-nowrap">Prazo</th>
              </tr>
            </thead>
            <tbody className="stagger">
              {lista.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum caso com esses filtros.
                  </td>
                </tr>
              )}
              {lista.map((c) => {
                const sla = situacaoSla(c.sla_prazo, c.status);
                return (
                  <tr
                    key={c.id}
                    onClick={() => nav(`/painel/casos/${c.id}`)}
                    className="border-t border-border cursor-pointer transition-colors duration-150 hover:bg-primary-soft/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{c.protocolo}</td>
                    <td className="px-4 py-3">{rotuloCategoria(c.categoria)}</td>
                    <td className="px-4 py-3"><PillGravidade g={c.gravidade} /></td>
                    <td className="px-4 py-3"><PillStatus s={c.status} /></td>
                    <td className={cn("px-4 py-3 text-xs whitespace-nowrap", sla.vencido && "text-critical font-semibold")}>
                      {sla.rotulo}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Sel({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {children}
    </select>
  );
}
