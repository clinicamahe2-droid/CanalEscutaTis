/**
 * Tipos de dominio do Canal de Escuta.
 *
 * Os nomes de campo e os valores de enum aqui espelham 1:1 o schema SQL em
 * `supabase/migrations`. O provider local e um "Supabase de mentira": nao ha
 * traducao de formato na hora de virar para o backend real.
 */

export type CategoriaId =
  | "assedio_moral"
  | "assedio_sexual"
  | "discriminacao"
  | "sobrecarga"
  | "conflito_colega"
  | "falta_reconhecimento"
  | "seguranca_trabalho"
  | "sugestao_melhoria";

export type Gravidade = "baixa" | "media" | "critica";

export type Urgencia = "alta" | "baixa";

export type StatusCaso =
  | "recebido"
  | "triagem"
  | "em_andamento"
  | "encaminhado"
  | "concluido";

export type CanalOrigem = "pwa" | "qrcode";

export type RemetenteMensagem = "equipe" | "anonimo";

export type AvaliacaoEncerramento = "nao_ouvido" | "em_parte" | "ouvido";

export type CanalNotificacao = "email" | "whatsapp";

export type RegraAlerta = "imediato" | "resumo_diario" | "resumo_semanal";

export interface Empresa {
  id: string;
  nome: string;
  dominio: string;
  criado_em: string;
}

export interface Caso {
  id: string;
  empresa_id: string;
  protocolo: string;
  categoria: CategoriaId;
  gravidade: Gravidade;
  status: StatusCaso;
  urgencia: Urgencia;
  canal_origem: CanalOrigem;
  setor: string | null;
  relato: string;
  quer_retorno: boolean;
  encaminhado: boolean;
  criado_em: string;
  atualizado_em: string;
  sla_prazo: string;
  encerrado_em: string | null;
}

export interface MensagemCaso {
  id: string;
  caso_id: string;
  empresa_id: string;
  remetente: RemetenteMensagem;
  conteudo: string;
  criado_em: string;
}

export interface Anexo {
  id: string;
  caso_id: string;
  empresa_id: string;
  storage_path: string;
  nome: string;
  tipo: string;
  tamanho: number;
  criado_em: string;
}

export interface HistoricoStatus {
  id: string;
  caso_id: string;
  empresa_id: string;
  status_anterior: StatusCaso | null;
  status_novo: StatusCaso;
  responsavel: string;
  criado_em: string;
}

export interface NotaInterna {
  id: string;
  caso_id: string;
  empresa_id: string;
  autor: string;
  conteudo: string;
  criado_em: string;
}

export interface PesquisaEncerramento {
  id: string;
  caso_id: string;
  empresa_id: string;
  avaliacao: AvaliacaoEncerramento;
  comentario: string | null;
  criado_em: string;
}

export interface MembroEquipe {
  id: string;
  user_id: string;
  empresa_id: string;
  nome: string;
  papel: string;
  crp: string | null;
}

export interface ConfiguracoesCanal {
  empresa_id: string;
  nome_canal: string;
  dominio: string;
  mensagem_boas_vindas: string;
  categorias_ativas: CategoriaId[];
  permitir_anexos: boolean;
  permitir_mensagens_pos_encerramento: boolean;
  pesquisa_encerramento_ativa: boolean;
  atualizado_em: string;
}

export interface NotificacaoFila {
  id: string;
  empresa_id: string;
  caso_id: string;
  protocolo: string;
  canal: CanalNotificacao;
  destinatario: string;
  assunto: string;
  corpo: string;
  regra: RegraAlerta;
  criado_em: string;
  enviado: boolean;
}

/** Rascunho vindo do fluxo do colaborador, antes de virar Caso no backend. */
export interface RascunhoRelato {
  categoria: CategoriaId | null;
  urgencia: Urgencia | null;
  relato: string;
  quer_retorno: boolean;
  anexo: {
    nome: string;
    tipo: string;
    tamanho: number;
    /** id no armazenamento de anexos (IndexedDB no modo local). */
    ref: string;
  } | null;
}

export interface ResultadoCriacaoCaso {
  protocolo: string;
  caso_id: string;
}
