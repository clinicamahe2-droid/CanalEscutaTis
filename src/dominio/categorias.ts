import type { CategoriaId, Gravidade, RegraAlerta } from "./tipos";

export interface CategoriaMeta {
  id: CategoriaId;
  rotulo: string;
  /** Uma linha explicando o que cobre — mostrada no seletor (Bloco categoria). */
  descricao: string;
  /** Gravidade sugerida na triagem automatica (a equipe pode reclassificar). */
  gravidadePadrao: Gravidade;
  /** Regra de aviso a equipe (ver aba Alertas). */
  regra: RegraAlerta;
}

export const CATEGORIAS: CategoriaMeta[] = [
  {
    id: "assedio_moral",
    rotulo: "Assédio moral",
    descricao: "Humilhação, gritos, ameaças ou pressão que se repetem.",
    gravidadePadrao: "media",
    regra: "resumo_diario",
  },
  {
    id: "assedio_sexual",
    rotulo: "Assédio sexual",
    descricao: "Cantada, insinuação ou toque que você não quis.",
    gravidadePadrao: "critica",
    regra: "imediato",
  },
  {
    id: "discriminacao",
    rotulo: "Discriminação",
    descricao: "Tratamento diferente por quem você é.",
    gravidadePadrao: "critica",
    regra: "imediato",
  },
  {
    id: "sobrecarga",
    rotulo: "Sobrecarga / jornada",
    descricao: "Trabalho demais, descanso de menos, horário que não fecha.",
    gravidadePadrao: "media",
    regra: "resumo_semanal",
  },
  {
    id: "conflito_colega",
    rotulo: "Conflito com colega",
    descricao: "Uma relação difícil que já atrapalha o trabalho.",
    gravidadePadrao: "media",
    regra: "resumo_diario",
  },
  {
    id: "falta_reconhecimento",
    rotulo: "Falta de reconhecimento",
    descricao: "Seu esforço não aparece pra ninguém.",
    gravidadePadrao: "baixa",
    regra: "resumo_semanal",
  },
  {
    id: "seguranca_trabalho",
    rotulo: "Segurança no trabalho",
    descricao: "Risco físico, equipamento faltando, algo perigoso.",
    gravidadePadrao: "critica",
    regra: "imediato",
  },
  {
    id: "sugestao_melhoria",
    rotulo: "Sugestão de melhoria",
    descricao: "Uma ideia pra alguma coisa funcionar melhor aqui.",
    gravidadePadrao: "baixa",
    regra: "resumo_semanal",
  },
];

const POR_ID = new Map(CATEGORIAS.map((c) => [c.id, c]));

export function categoriaMeta(id: CategoriaId): CategoriaMeta {
  return POR_ID.get(id) ?? CATEGORIAS[0];
}

export function rotuloCategoria(id: CategoriaId): string {
  return POR_ID.get(id)?.rotulo ?? id;
}

export const GRAVIDADE_ROTULO: Record<Gravidade, string> = {
  baixa: "Baixa",
  media: "Média",
  critica: "Crítica",
};

export const STATUS_ROTULO = {
  recebido: "Recebido",
  triagem: "Em triagem",
  em_andamento: "Em andamento",
  encaminhado: "Encaminhado",
  concluido: "Concluído",
} as const;

/** Ordem de severidade — usada para ordenar filas e mapas de risco. */
export const ORDEM_GRAVIDADE: Record<Gravidade, number> = {
  critica: 0,
  media: 1,
  baixa: 2,
};
