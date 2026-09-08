import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PillGravidade, PillStatus } from "@/components/equipe/pills";
import { AnexoImagem } from "@/components/equipe/AnexoImagem";
import {
  useCasoDetalhe,
  useResponderCaso,
  useAdicionarNota,
  useReclassificar,
  useMudarStatus,
  useEncaminhar,
  useEncerrar,
} from "@/hooks/dados";
import { CATEGORIAS, rotuloCategoria, GRAVIDADE_ROTULO } from "@/dominio/categorias";
import { formatarDataHora } from "@/lib/datas";
import { situacaoSla } from "@/dominio/sla";
import type { CategoriaId, Gravidade, StatusCaso } from "@/dominio/tipos";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CasoDetalhe() {
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useCasoDetalhe(id);

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }
  if (isError || !data) {
    return (
      <div className="animate-fade-in">
        <VoltarLink />
        <p className="mt-6 text-sm text-muted-foreground">Caso não encontrado.</p>
      </div>
    );
  }

  const { caso } = data;
  const sla = situacaoSla(caso.sla_prazo, caso.status);

  return (
    <div className="animate-fade-in">
      <VoltarLink />

      <header className="flex flex-wrap items-start justify-between gap-3 mt-3 mb-5">
        <div>
          <div className="font-mono text-lg font-semibold text-primary-dark">{caso.protocolo}</div>
          <div className="text-sm text-muted-foreground">
            {rotuloCategoria(caso.categoria)}
            {caso.setor ? ` · Setor ${caso.setor}` : ""}
          </div>
          {caso.encaminhado && (
            <Badge variant="warning" className="mt-2">Encaminhado ao RH/jurídico</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <PillGravidade g={caso.gravidade} />
          <PillStatus s={caso.status} />
        </div>
      </header>

      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6 items-start">
        {/* coluna principal */}
        <div className="space-y-5 min-w-0">
          <section>
            <RotuloCampo>Relato</RotuloCampo>
            <div className="rounded-xl bg-surface2 p-4 text-sm whitespace-pre-wrap">{caso.relato}</div>
          </section>

          {data.anexos.length > 0 && (
            <section>
              <RotuloCampo>Anexos</RotuloCampo>
              <div className="space-y-2">
                {data.anexos.map((a) => (
                  <AnexoImagem key={a.id} anexo={a} />
                ))}
              </div>
            </section>
          )}

          <NotasInternas casoId={id} notas={data.notas} />

          <Conversa casoId={id} mensagens={data.mensagens} />
        </div>

        {/* coluna lateral */}
        <div className="space-y-4">
          <Reclassificar
            casoId={id}
            categoria={caso.categoria}
            gravidade={caso.gravidade}
          />

          <div className="rounded-xl border border-border p-4 text-sm space-y-1.5">
            <LinhaKV k="Recebido em" v={formatarDataHora(caso.criado_em)} />
            <LinhaKV k="Prazo SLA" v={sla.rotulo} destaque={sla.vencido} />
            <LinhaKV k="Quer retorno" v={caso.quer_retorno ? "Sim" : "Não"} />
            <LinhaKV k="Origem" v={caso.canal_origem.toUpperCase()} />
          </div>

          <MudarStatus casoId={id} status={caso.status} />

          <AcoesCaso
            casoId={id}
            encaminhado={caso.encaminhado}
            concluido={caso.status === "concluido"}
          />
        </div>
      </div>
    </div>
  );
}

function VoltarLink() {
  return (
    <Link to="/painel/casos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-dark">
      <ArrowLeft className="w-4 h-4" />
      Voltar à caixa de casos
    </Link>
  );
}

function RotuloCampo({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs uppercase tracking-wide text-muted-foreground font-mono mb-1.5 block">
      {children}
    </span>
  );
}

function LinhaKV({ k, v, destaque }: { k: string; v: string; destaque?: boolean }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed border-border pb-1.5 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("font-semibold text-right", destaque && "text-critical")}>{v}</span>
    </div>
  );
}

function NotasInternas({ casoId, notas }: { casoId: string; notas: { id: string; autor: string; conteudo: string; criado_em: string }[] }) {
  const [texto, setTexto] = useState("");
  const add = useAdicionarNota(casoId);
  return (
    <section>
      <RotuloCampo>Nota interna: só a equipe vê</RotuloCampo>
      <div className="rounded-xl bg-warning-soft/60 p-3 space-y-2">
        {notas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma nota ainda.</p>}
        {notas.map((n) => (
          <div key={n.id} className="text-sm">
            <div className="text-[0.62rem] font-mono uppercase text-warning">
              {n.autor} · {formatarDataHora(n.criado_em)}
            </div>
            <div className="whitespace-pre-wrap">{n.conteudo}</div>
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Anotação visível apenas para a equipe…"
            className="flex-1 min-h-[40px] rounded-lg border border-border bg-card p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button
            size="sm"
            variant="secondary"
            disabled={!texto.trim() || add.isPending}
            onClick={async () => {
              try {
                await add.mutateAsync(texto.trim());
                setTexto("");
              } catch {
                toast.error("Não foi possível salvar a nota.");
              }
            }}
          >
            {add.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Conversa({
  casoId,
  mensagens,
}: {
  casoId: string;
  mensagens: { id: string; remetente: string; conteudo: string; criado_em: string }[];
}) {
  const [texto, setTexto] = useState("");
  const responder = useResponderCaso(casoId);
  return (
    <section>
      <RotuloCampo>Conversa por protocolo: sem identidade</RotuloCampo>
      <div className="rounded-xl border border-border p-3 space-y-2 max-h-72 overflow-y-auto">
        {mensagens.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma mensagem trocada ainda.</p>
        )}
        {mensagens.map((m) => (
          <div
            key={m.id}
            className={cn(
              "rounded-lg p-2.5 text-sm max-w-[88%]",
              m.remetente === "equipe"
                ? "bg-surface2"
                : "bg-primary-soft text-primary-dark ml-auto",
            )}
          >
            <div className="text-[0.6rem] font-mono uppercase text-muted-foreground mb-1">
              {m.remetente === "equipe" ? "Equipe de Escuta" : "Anônimo"} · {formatarDataHora(m.criado_em)}
            </div>
            {m.conteudo}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Pedir mais informações sem revelar quem pergunta do outro lado…"
          className="flex-1 min-h-[44px] rounded-lg border border-border bg-card p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button
          size="icon"
          disabled={!texto.trim() || responder.isPending}
          onClick={async () => {
            try {
              await responder.mutateAsync(texto.trim());
              setTexto("");
            } catch {
              toast.error("Não foi possível enviar a mensagem.");
            }
          }}
        >
          {responder.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </section>
  );
}

function Reclassificar({
  casoId,
  categoria,
  gravidade,
}: {
  casoId: string;
  categoria: CategoriaId;
  gravidade: Gravidade;
}) {
  const recl = useReclassificar(casoId);
  return (
    <div className="rounded-xl border border-border p-4">
      <h3 className="text-sm font-display font-semibold mb-3">Reclassificar</h3>
      <label className="text-xs text-muted-foreground">Categoria</label>
      <select
        value={categoria}
        onChange={(e) => recl.mutate({ categoria: e.target.value as CategoriaId })}
        disabled={recl.isPending}
        className="w-full mt-1 mb-3 rounded-lg border border-border bg-card px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {CATEGORIAS.map((c) => (
          <option key={c.id} value={c.id}>{c.rotulo}</option>
        ))}
      </select>
      <label className="text-xs text-muted-foreground">Gravidade</label>
      <select
        value={gravidade}
        onChange={(e) => recl.mutate({ gravidade: e.target.value as Gravidade })}
        disabled={recl.isPending}
        className="w-full mt-1 rounded-lg border border-border bg-card px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {(["critica", "media", "baixa"] as Gravidade[]).map((g) => (
          <option key={g} value={g}>{GRAVIDADE_ROTULO[g]}</option>
        ))}
      </select>
      {recl.isPending && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> salvando…
        </p>
      )}
    </div>
  );
}

const PROXIMOS: { valor: StatusCaso; rot: string }[] = [
  { valor: "triagem", rot: "Marcar em triagem" },
  { valor: "em_andamento", rot: "Marcar em andamento" },
];

function MudarStatus({ casoId, status }: { casoId: string; status: StatusCaso }) {
  const mudar = useMudarStatus(casoId);
  if (status === "concluido") return null;
  return (
    <div className="rounded-xl border border-border p-4 space-y-2">
      <h3 className="text-sm font-display font-semibold">Andamento</h3>
      {PROXIMOS.filter((p) => p.valor !== status).map((p) => (
        <Button
          key={p.valor}
          variant="outline"
          size="sm"
          className="w-full justify-start"
          disabled={mudar.isPending}
          onClick={() => mudar.mutate(p.valor)}
        >
          {p.rot}
        </Button>
      ))}
    </div>
  );
}

function AcoesCaso({
  casoId,
  encaminhado,
  concluido,
}: {
  casoId: string;
  encaminhado: boolean;
  concluido: boolean;
}) {
  const encaminhar = useEncaminhar(casoId);
  const encerrar = useEncerrar(casoId);
  return (
    <div className="space-y-2">
      <Button
        variant="secondary"
        className="w-full"
        disabled={encaminhado || encaminhar.isPending}
        onClick={async () => {
          try {
            await encaminhar.mutateAsync();
            toast.success("Caso encaminhado ao RH/jurídico.");
          } catch {
            toast.error("Não foi possível encaminhar.");
          }
        }}
      >
        {encaminhar.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {encaminhado ? "Já encaminhado ao RH/jurídico" : "Encaminhar ao RH/jurídico"}
      </Button>
      <Button
        className="w-full"
        disabled={concluido || encerrar.isPending}
        onClick={async () => {
          try {
            await encerrar.mutateAsync();
            toast.success("Caso encerrado. A pesquisa de encerramento foi liberada.");
          } catch {
            toast.error("Não foi possível encerrar.");
          }
        }}
      >
        {encerrar.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        {concluido ? "Caso encerrado" : "Encerrar caso"}
      </Button>
    </div>
  );
}
