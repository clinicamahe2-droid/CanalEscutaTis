// Espelha src/dominio/categorias.ts (gravidade padrao + regra de alerta).
export type Regra = "imediato" | "resumo_diario" | "resumo_semanal";

export const CATEGORIA: Record<string, { rotulo: string; gravidade: string; regra: Regra }> = {
  assedio_moral: { rotulo: "Assédio moral", gravidade: "media", regra: "resumo_diario" },
  assedio_sexual: { rotulo: "Assédio sexual", gravidade: "critica", regra: "imediato" },
  discriminacao: { rotulo: "Discriminação", gravidade: "critica", regra: "imediato" },
  sobrecarga: { rotulo: "Sobrecarga / jornada", gravidade: "media", regra: "resumo_semanal" },
  conflito_colega: { rotulo: "Conflito com colega", gravidade: "media", regra: "resumo_diario" },
  falta_reconhecimento: { rotulo: "Falta de reconhecimento", gravidade: "baixa", regra: "resumo_semanal" },
  seguranca_trabalho: { rotulo: "Segurança no trabalho", gravidade: "critica", regra: "imediato" },
  sugestao_melhoria: { rotulo: "Sugestão de melhoria", gravidade: "baixa", regra: "resumo_semanal" },
};

const DIAS_UTEIS: Record<string, number> = { critica: 1, media: 5, baixa: 10 };

export function calcularPrazoSla(base: Date, gravidade: string): string {
  const d = new Date(base.getTime());
  let restantes = DIAS_UTEIS[gravidade] ?? 5;
  while (restantes > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) restantes--;
  }
  return d.toISOString();
}
