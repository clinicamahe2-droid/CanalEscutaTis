import { Loader2, Mail, MessageCircle } from "lucide-react";
import { useNotificacoes } from "@/hooks/dados";
import { formatarDataHora } from "@/lib/datas";
import { MODO_DADOS } from "@/data";

const REGRAS = [
  {
    tipo: "Assédio sexual · Segurança no trabalho · qualquer caso marcado como urgente",
    canal: "E-mail imediato (+ WhatsApp no nível crítico)",
    destinatario: "Márcia Bússolo",
    prazo: "24 h",
    tom: "critical" as const,
  },
  {
    tipo: "Discriminação / ilegalidade",
    canal: "E-mail imediato",
    destinatario: "Equipe de escuta",
    prazo: "72 h",
    tom: "warning" as const,
  },
  {
    tipo: "Assédio moral · Conflito com colega",
    canal: "Resumo diário por e-mail",
    destinatario: "Equipe de escuta",
    prazo: "5 dias úteis",
    tom: "neutral" as const,
  },
  {
    tipo: "Sobrecarga · Falta de reconhecimento · Sugestão de melhoria",
    canal: "Resumo semanal por e-mail",
    destinatario: "Equipe de escuta",
    prazo: "10 dias úteis",
    tom: "neutral" as const,
  },
];

export default function Alertas() {
  const { data: fila, isLoading } = useNotificacoes();

  return (
    <div className="animate-fade-in">
      <header className="mb-4">
        <h1 className="text-xl font-display font-semibold">Alertas</h1>
        <p className="text-sm text-muted-foreground">
          Como a equipe é avisada de um caso novo sem depender de abrir o painel.
        </p>
      </header>

      <p className="text-sm text-foreground/80 max-w-2xl mb-4">
        Um caso crítico não pode esperar alguém abrir o painel. Cada gravidade dispara um canal de
        aviso diferente. Estas regras ainda não são editáveis nesta fase.
      </p>

      <div className="border border-border rounded-xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface2 text-[0.62rem] font-mono uppercase tracking-wide text-muted-foreground">
                <th className="text-left px-4 py-2.5">Tipo de caso</th>
                <th className="text-left px-4 py-2.5">Canal de aviso</th>
                <th className="text-left px-4 py-2.5">Destinatário</th>
                <th className="text-left px-4 py-2.5">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {REGRAS.map((r) => (
                <tr key={r.tipo} className="border-t border-border align-top">
                  <td className="px-4 py-3 font-semibold text-foreground">{r.tipo}</td>
                  <td className="px-4 py-3">{r.canal}</td>
                  <td className="px-4 py-3">{r.destinatario}</td>
                  <td className="px-4 py-3 font-mono whitespace-nowrap">{r.prazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h2 className="text-sm font-display font-semibold mb-1">Caixa de saída</h2>
      <p className="text-xs text-muted-foreground mb-3">
        {MODO_DADOS === "local"
          ? "No modo demonstração, cada aviso que seria enviado fica registrado aqui em vez de sair por e-mail/WhatsApp."
          : "Avisos disparados pela Edge Function de notificação."}
      </p>

      {isLoading ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (fila ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum aviso disparado ainda.</p>
      ) : (
        <div className="space-y-3">
          {(fila ?? []).map((n) => (
            <div key={n.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                {n.canal === "whatsapp" ? (
                  <MessageCircle className="w-3.5 h-3.5" />
                ) : (
                  <Mail className="w-3.5 h-3.5" />
                )}
                <span className="font-mono uppercase">{n.regra.replace("_", " ")}</span>
                <span>·</span>
                <span>{n.destinatario}</span>
                <span className="ml-auto">{formatarDataHora(n.criado_em)}</span>
              </div>
              <div className="font-semibold text-sm">{n.assunto}</div>
              <pre className="mt-1 whitespace-pre-wrap font-body text-sm text-foreground/80">{n.corpo}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
