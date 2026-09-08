import type {
  Anexo,
  Caso,
  CategoriaId,
  ConfiguracoesCanal,
  Gravidade,
  HistoricoStatus,
  MensagemCaso,
  NotaInterna,
  NotificacaoFila,
  PesquisaEncerramento,
  RascunhoAtendimento,
  RascunhoRelato,
  RemetenteMensagem,
  ResultadoCriacaoCaso,
  SolicitacaoAtendimento,
  StatusCaso,
  StatusSolicitacao,
  AvaliacaoEncerramento,
} from "@/dominio/tipos";

export const MODO_DADOS: "local" | "supabase" =
  import.meta.env.VITE_DATA_PROVIDER === "supabase" ? "supabase" : "local";

export const EMPRESA_ID =
  import.meta.env.VITE_EMPRESA_ID || "00000000-0000-0000-0000-000000000001";

/** Visao publica do caso — o que a tela de consulta por protocolo pode ver. */
export interface CasoPublico {
  protocolo: string;
  categoriaRotulo: string;
  status: StatusCaso;
  criado_em: string;
  quer_retorno: boolean;
  mensagens: Array<{ remetente: RemetenteMensagem; conteudo: string; criado_em: string }>;
  permiteResponder: boolean;
  pesquisaLiberada: boolean;
  pesquisaRespondida: boolean;
}

export interface ConfigPublica {
  nome_canal: string;
  mensagem_boas_vindas: string;
  categorias_ativas: CategoriaId[];
  permitir_anexos: boolean;
}

export interface CasoDetalheEquipe {
  caso: Caso;
  mensagens: MensagemCaso[];
  notas: NotaInterna[];
  historico: HistoricoStatus[];
  anexos: Anexo[];
  pesquisa: PesquisaEncerramento | null;
}

export interface DadosPainel {
  casos: Caso[];
  mensagens: MensagemCaso[];
  pesquisas: PesquisaEncerramento[];
}

export interface DataProvider {
  // ---- colaborador (anonimo) ----
  getConfigPublica(): Promise<ConfigPublica>;
  criarCaso(rascunho: RascunhoRelato): Promise<ResultadoCriacaoCaso>;
  /** Pedido de Atendimento Psicológico — identificado, sem protocolo (ver tipos.ts). */
  criarSolicitacaoAtendimento(rascunho: RascunhoAtendimento): Promise<void>;
  consultarCaso(protocolo: string): Promise<CasoPublico | null>;
  enviarMensagemAnonima(protocolo: string, conteudo: string): Promise<void>;
  responderPesquisa(
    protocolo: string,
    avaliacao: AvaliacaoEncerramento,
    comentario: string,
  ): Promise<void>;

  // ---- equipe clinica (autenticada) ----
  getDadosPainel(): Promise<DadosPainel>;
  getCasoDetalhe(casoId: string): Promise<CasoDetalheEquipe>;
  responderCaso(casoId: string, conteudo: string): Promise<MensagemCaso>;
  adicionarNota(casoId: string, conteudo: string, autor: string): Promise<NotaInterna>;
  reclassificarCaso(
    casoId: string,
    patch: { categoria?: CategoriaId; gravidade?: Gravidade },
    responsavel: string,
  ): Promise<Caso>;
  mudarStatus(casoId: string, novo: StatusCaso, responsavel: string): Promise<Caso>;
  encaminharCaso(casoId: string, responsavel: string): Promise<Caso>;
  encerrarCaso(casoId: string, responsavel: string): Promise<Caso>;

  listarNotificacoes(): Promise<NotificacaoFila[]>;

  // ---- Atendimento Psicológico (identificado, tela dedicada no painel) ----
  listarSolicitacoesAtendimento(): Promise<SolicitacaoAtendimento[]>;
  mudarStatusSolicitacao(id: string, status: StatusSolicitacao): Promise<SolicitacaoAtendimento>;

  getConfiguracoes(): Promise<ConfiguracoesCanal>;
  salvarConfiguracoes(patch: Partial<ConfiguracoesCanal>): Promise<ConfiguracoesCanal>;

  /** URL exibivel para um anexo (objectURL no local, signed URL no supabase). */
  getAnexoUrl(anexo: Anexo): Promise<string | null>;

  /** Reseta os dados de exemplo (so faz algo no modo local). */
  resetarDemo?(): Promise<void>;
}
