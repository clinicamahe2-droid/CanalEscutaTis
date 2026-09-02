import { useMemo } from "react";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDadosPainel } from "@/hooks/dados";
import { resumoMensal, tendenciaMensal } from "@/dominio/agregacoes";
import { exportarComoPdf } from "@/lib/imprimir";
import { formatarData } from "@/lib/datas";

export default function Relatorios() {
  const { data, isLoading } = useDadosPainel();

  const resumo = useMemo(
    () => (data ? resumoMensal(data.casos, data.pesquisas) : null),
    [data],
  );
  const historico = useMemo(() => {
    if (!data) return [];
    const t = tendenciaMensal(data.casos, 6);
    return t.slice(0, -1).reverse();
  }, [data]);

  if (isLoading || !resumo) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in print-container">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-semibold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Alimentam o PGR / plano de ação de riscos psicossociais.
          </p>
        </div>
        <Button className="no-print" onClick={() => exportarComoPdf(`Canal de Escuta — ${resumo.mesRotulo}`)}>
          <Printer className="w-4 h-4" />
          Exportar PDF
        </Button>
      </header>

      <article className="rounded-xl border border-border p-6">
        <h2 className="text-lg font-display font-semibold">
          Relatório de Riscos Psicossociais — {resumo.mesRotulo}
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Gerado a partir dos casos criados no mês corrente.
        </p>

        <ul className="text-sm text-foreground/85 space-y-1.5 list-disc pl-5 mb-4">
          <li>
            {resumo.totalRelatos} relato{resumo.totalRelatos === 1 ? "" : "s"} recebido
            {resumo.totalRelatos === 1 ? "" : "s"}, {resumo.emAberto} em aberto, {resumo.emAtraso} em
            atraso de SLA.
          </li>
          {resumo.porCategoria[0] && (
            <li>
              Categoria mais recorrente: {resumo.porCategoria[0].rotulo} ({resumo.porCategoria[0].total}{" "}
              caso{resumo.porCategoria[0].total === 1 ? "" : "s"}).
            </li>
          )}
          <li>
            {resumo.percentualOuvido == null
              ? "Ainda sem respostas da pesquisa de encerramento neste mês."
              : `${resumo.percentualOuvido}% dos respondentes da pesquisa de encerramento sentiram-se ouvidos.`}
          </li>
          <li>
            {resumo.encaminhados} caso{resumo.encaminhados === 1 ? "" : "s"} encaminhado
            {resumo.encaminhados === 1 ? "" : "s"} a RH/jurídico.
          </li>
        </ul>

        <div className="border-t border-border pt-3">
          <h3 className="text-sm font-semibold mb-2">Distribuição por categoria</h3>
          <table className="text-sm w-full max-w-sm">
            <tbody>
              {resumo.porCategoria.length === 0 && (
                <tr>
                  <td className="text-muted-foreground py-1">Sem casos neste mês.</td>
                </tr>
              )}
              {resumo.porCategoria.map((c) => (
                <tr key={c.rotulo} className="border-b border-dashed border-border last:border-0">
                  <td className="py-1.5">{c.rotulo}</td>
                  <td className="py-1.5 text-right font-mono">{c.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>

      <section className="mt-6 no-print">
        <h2 className="text-sm font-display font-semibold mb-2">Histórico</h2>
        <div className="rounded-xl border border-border divide-y divide-border">
          {historico.map((h) => (
            <div key={h.chave} className="flex justify-between px-4 py-2.5 text-sm">
              <span className="capitalize">
                {h.rotulo} {h.ano}
              </span>
              <span className="font-mono text-muted-foreground">{h.total} casos</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Cada mês fechado gera um PDF arquivável. Data de referência: {formatarData(new Date().toISOString())}.
        </p>
      </section>
    </div>
  );
}
