import type { Gravidade, StatusCaso } from "./tipos";

/**
 * SLA de primeira resposta por gravidade, em dias uteis.
 * Deriva da tabela da aba "Alertas" do prototipo:
 *   critica  -> 24h  (~1 dia util)
 *   media    -> 5 dias uteis
 *   baixa    -> 10 dias uteis
 */
export const SLA_DIAS_UTEIS: Record<Gravidade, number> = {
  critica: 1,
  media: 5,
  baixa: 10,
};

const UM_DIA_MS = 24 * 60 * 60 * 1000;

/** Soma `dias` dias uteis (seg-sex) a uma data, ignorando feriados. */
export function somarDiasUteis(base: Date, dias: number): Date {
  const d = new Date(base.getTime());
  let restantes = Math.max(0, Math.ceil(dias));
  while (restantes > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) restantes--;
  }
  return d;
}

export function calcularPrazoSla(criadoEm: string | Date, gravidade: Gravidade): string {
  const base = typeof criadoEm === "string" ? new Date(criadoEm) : criadoEm;
  return somarDiasUteis(base, SLA_DIAS_UTEIS[gravidade]).toISOString();
}

const STATUS_FINAIS: StatusCaso[] = ["concluido"];

export interface SituacaoSla {
  vencido: boolean;
  /** Dias uteis inteiros ate o prazo (negativo = em atraso). */
  diasRestantes: number;
  rotulo: string;
}

/** Conta dias uteis entre duas datas (pode ser negativo). */
export function diasUteisEntre(de: Date, ate: Date): number {
  const ini = new Date(Date.UTC(de.getUTCFullYear(), de.getUTCMonth(), de.getUTCDate()));
  const fim = new Date(Date.UTC(ate.getUTCFullYear(), ate.getUTCMonth(), ate.getUTCDate()));
  const sinal = fim >= ini ? 1 : -1;
  let cursor = new Date(sinal > 0 ? ini : fim);
  const alvo = new Date(sinal > 0 ? fim : ini);
  let uteis = 0;
  while (cursor < alvo) {
    cursor = new Date(cursor.getTime() + UM_DIA_MS);
    const dow = cursor.getUTCDay();
    if (dow !== 0 && dow !== 6) uteis++;
  }
  return uteis * sinal;
}

export function situacaoSla(
  slaPrazo: string,
  status: StatusCaso,
  agora: Date = new Date(),
): SituacaoSla {
  if (STATUS_FINAIS.includes(status)) {
    return { vencido: false, diasRestantes: 0, rotulo: "Encerrado" };
  }
  const prazo = new Date(slaPrazo);
  const restantes = diasUteisEntre(agora, prazo);
  if (agora.getTime() > prazo.getTime()) {
    const atraso = Math.abs(restantes);
    return {
      vencido: true,
      diasRestantes: restantes,
      rotulo: atraso <= 0 ? "Vence hoje" : `Vencido há ${atraso} dia${atraso === 1 ? "" : "s"}`,
    };
  }
  if (restantes <= 0) return { vencido: false, diasRestantes: 0, rotulo: "Vence hoje" };
  return {
    vencido: false,
    diasRestantes: restantes,
    rotulo: `${restantes} dia${restantes === 1 ? "" : "s"} útil${restantes === 1 ? "" : "eis"} restante${restantes === 1 ? "" : "s"}`,
  };
}
