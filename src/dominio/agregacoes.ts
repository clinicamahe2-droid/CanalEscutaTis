import type { Caso, MensagemCaso, PesquisaEncerramento, CategoriaId } from "./tipos";
import { rotuloCategoria } from "./categorias";
import { situacaoSla } from "./sla";

export interface IndicadoresGerais {
  casosAbertos: number;
  /** Tempo medio ate a 1a resposta da equipe, em dias (1 casa). null se ninguem respondeu ainda. */
  tempoMedioPrimeiraRespostaDias: number | null;
  casosForaDoPrazo: number;
  /** 0..100, ou null se nao ha pesquisas respondidas. */
  percentualOuvido: number | null;
  totalRelatos: number;
  encaminhados: number;
}

export interface FatiaRisco {
  categoria: CategoriaId;
  rotulo: string;
  total: number;
  /** 0..100 relativo a categoria mais frequente. */
  proporcao: number;
}

export interface PontoMensal {
  chave: string; // "2026-09"
  rotulo: string; // "set"
  ano: number;
  total: number;
}

const MESES_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

const STATUS_ABERTO = (c: Caso) => c.status !== "concluido";

export function indicadoresGerais(
  casos: Caso[],
  mensagens: MensagemCaso[],
  pesquisas: PesquisaEncerramento[],
  agora: Date = new Date(),
): IndicadoresGerais {
  const abertos = casos.filter(STATUS_ABERTO);

  const primeirasRespostas: number[] = [];
  const msgsPorCaso = new Map<string, MensagemCaso[]>();
  for (const m of mensagens) {
    if (m.remetente !== "equipe") continue;
    const arr = msgsPorCaso.get(m.caso_id) ?? [];
    arr.push(m);
    msgsPorCaso.set(m.caso_id, arr);
  }
  for (const c of casos) {
    const msgs = msgsPorCaso.get(c.id);
    if (!msgs || msgs.length === 0) continue;
    const primeira = msgs.reduce((a, b) => (a.criado_em < b.criado_em ? a : b));
    const delta = new Date(primeira.criado_em).getTime() - new Date(c.criado_em).getTime();
    if (delta >= 0) primeirasRespostas.push(delta);
  }
  const tempoMedio =
    primeirasRespostas.length === 0
      ? null
      : Math.round(
          (primeirasRespostas.reduce((a, b) => a + b, 0) /
            primeirasRespostas.length /
            (24 * 60 * 60 * 1000)) *
            10,
        ) / 10;

  const foraDoPrazo = casos.filter((c) => situacaoSla(c.sla_prazo, c.status, agora).vencido).length;

  const respondidas = pesquisas.length;
  const ouvidos = pesquisas.filter((p) => p.avaliacao === "ouvido").length;
  const percentualOuvido = respondidas === 0 ? null : Math.round((ouvidos / respondidas) * 100);

  return {
    casosAbertos: abertos.length,
    tempoMedioPrimeiraRespostaDias: tempoMedio,
    casosForaDoPrazo: foraDoPrazo,
    percentualOuvido,
    totalRelatos: casos.length,
    encaminhados: casos.filter((c) => c.encaminhado).length,
  };
}

export function mapaDeRisco(casos: Caso[]): FatiaRisco[] {
  const contagem = new Map<CategoriaId, number>();
  for (const c of casos) contagem.set(c.categoria, (contagem.get(c.categoria) ?? 0) + 1);
  const linhas = [...contagem.entries()].map(([categoria, total]) => ({
    categoria,
    rotulo: rotuloCategoria(categoria),
    total,
    proporcao: 0,
  }));
  linhas.sort((a, b) => b.total - a.total || a.rotulo.localeCompare(b.rotulo));
  const maior = linhas[0]?.total ?? 0;
  for (const l of linhas) l.proporcao = maior === 0 ? 0 : Math.round((l.total / maior) * 100);
  return linhas;
}

export function tendenciaMensal(
  casos: Caso[],
  meses = 6,
  referencia: Date = new Date(),
): PontoMensal[] {
  const pontos: PontoMensal[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(referencia.getUTCFullYear(), referencia.getUTCMonth() - i, 1));
    const chave = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    pontos.push({ chave, rotulo: MESES_PT[d.getUTCMonth()], ano: d.getUTCFullYear(), total: 0 });
  }
  const idx = new Map(pontos.map((p, i) => [p.chave, i]));
  for (const c of casos) {
    const d = new Date(c.criado_em);
    const chave = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const i = idx.get(chave);
    if (i !== undefined) pontos[i].total++;
  }
  return pontos;
}

export interface ResumoMensal {
  mesRotulo: string;
  totalRelatos: number;
  emAberto: number;
  emAtraso: number;
  encaminhados: number;
  porCategoria: { rotulo: string; total: number }[];
  percentualOuvido: number | null;
}

export function resumoMensal(
  casos: Caso[],
  pesquisas: PesquisaEncerramento[],
  referencia: Date = new Date(),
): ResumoMensal {
  const ano = referencia.getUTCFullYear();
  const mes = referencia.getUTCMonth();
  const noMes = (iso: string) => {
    const d = new Date(iso);
    return d.getUTCFullYear() === ano && d.getUTCMonth() === mes;
  };
  const doMes = casos.filter((c) => noMes(c.criado_em));
  const pesqMes = pesquisas.filter((p) => noMes(p.criado_em));
  const ouvidos = pesqMes.filter((p) => p.avaliacao === "ouvido").length;

  return {
    mesRotulo: `${MESES_PT[mes]}/${ano}`,
    totalRelatos: doMes.length,
    emAberto: doMes.filter(STATUS_ABERTO).length,
    emAtraso: doMes.filter((c) => situacaoSla(c.sla_prazo, c.status, referencia).vencido).length,
    encaminhados: doMes.filter((c) => c.encaminhado).length,
    porCategoria: mapaDeRisco(doMes).map((f) => ({ rotulo: f.rotulo, total: f.total })),
    percentualOuvido: pesqMes.length === 0 ? null : Math.round((ouvidos / pesqMes.length) * 100),
  };
}
