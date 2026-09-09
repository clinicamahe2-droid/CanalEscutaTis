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
    descricao: "Alguém grita, humilha, ameaça ou pressiona você sempre, não foi só uma vez.",
    gravidadePadrao: "media",
    regra: "resumo_diario",
  },
  {
    id: "assedio_sexual",
    rotulo: "Assédio sexual",
    descricao: "Comentário, insinuação ou toque de forma sexual que você não quis e te incomodou.",
    gravidadePadrao: "critica",
    regra: "imediato",
  },
  {
    id: "discriminacao",
    rotulo: "Discriminação",
    descricao: "Ser tratado pior por causa da sua cor, gênero, idade, religião ou deficiência.",
    gravidadePadrao: "critica",
    regra: "imediato",
  },
  {
    id: "sobrecarga",
    rotulo: "Sobrecarga / jornada",
    descricao: "Trabalhar demais, sem descanso suficiente, ou horário que não é respeitado.",
    gravidadePadrao: "media",
    regra: "resumo_semanal",
  },
  {
    id: "conflito_colega",
    rotulo: "Conflito com colega",
    descricao: "Uma briga ou desentendimento com um colega que está atrapalhando seu trabalho.",
    gravidadePadrao: "media",
    regra: "resumo_diario",
  },
  {
    id: "falta_reconhecimento",
    rotulo: "Falta de reconhecimento",
    descricao: "Você se esforça, mas ninguém elogia, agradece ou reconhece o seu trabalho.",
    gravidadePadrao: "baixa",
    regra: "resumo_semanal",
  },
  {
    id: "seguranca_trabalho",
    rotulo: "Segurança no trabalho",
    descricao: "Algo que pode te machucar: equipamento quebrado, faltando, ou risco de acidente.",
    gravidadePadrao: "critica",
    regra: "imediato",
  },
  {
    id: "sugestao_melhoria",
    rotulo: "Sugestão de melhoria",
    descricao: "Uma ideia sua pra melhorar algo no trabalho, mesmo sem ser um problema.",
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
