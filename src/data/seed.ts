import type {
  Anexo,
  Caso,
  ConfiguracoesCanal,
  Empresa,
  HistoricoStatus,
  MensagemAtendimento,
  MensagemCaso,
  NotaInterna,
  NotificacaoFila,
  PesquisaEncerramento,
  SolicitacaoAtendimento,
} from "@/dominio/tipos";
import { CATEGORIAS } from "@/dominio/categorias";
import { EMPRESA_ID } from "./DataProvider";

export interface BancoLocal {
  empresa: Empresa;
  config: ConfiguracoesCanal;
  casos: Caso[];
  mensagens: MensagemCaso[];
  notas: NotaInterna[];
  historico: HistoricoStatus[];
  anexos: Anexo[];
  pesquisas: PesquisaEncerramento[];
  notificacoes: NotificacaoFila[];
  solicitacoes: SolicitacaoAtendimento[];
  mensagensAtendimento: MensagemAtendimento[];
}

const MENSAGEM_BOAS_VINDAS =
  "Você pode relatar sem se identificar. Não registramos seu nome, seu IP ou o aparelho que você está usando, só o que você quiser contar.";

/**
 * Banco inicial do modo local: só a empresa e a configuração do canal. Não há
 * mais casos, mensagens ou pedidos de exemplo (ver DECISOES.md, 2026-09-18).
 */
export function criarBancoInicial(): BancoLocal {
  const agora = new Date().toISOString();

  const empresa: Empresa = {
    id: EMPRESA_ID,
    nome: "TIS · Terminal Intermodal Sul",
    dominio: "escuta.tis.com.br",
    criado_em: agora,
  };

  const config: ConfiguracoesCanal = {
    empresa_id: EMPRESA_ID,
    nome_canal: "Canal de Escuta",
    dominio: "escuta.tis.com.br",
    mensagem_boas_vindas: MENSAGEM_BOAS_VINDAS,
    categorias_ativas: CATEGORIAS.map((c) => c.id),
    permitir_anexos: true,
    permitir_mensagens_pos_encerramento: false,
    pesquisa_encerramento_ativa: true,
    atualizado_em: agora,
  };

  return {
    empresa,
    config,
    casos: [],
    mensagens: [],
    notas: [],
    historico: [],
    anexos: [],
    pesquisas: [],
    notificacoes: [],
    solicitacoes: [],
    mensagensAtendimento: [],
  };
}

const ehDemo = (id: string) => id.endsWith("_seed");

/**
 * Tira de um banco já salvo no navegador os registros de exemplo que versões
 * antigas do app gravavam (todos têm id terminado em `_seed`). Registros reais
 * (ids gerados em tempo de uso) ficam intactos. Retorna true se mudou algo.
 */
export function removerDadosDemo(banco: BancoLocal): boolean {
  const demoCasos = new Set(banco.casos.filter((c) => ehDemo(c.id)).map((c) => c.id));
  const antes =
    banco.casos.length +
    banco.mensagens.length +
    banco.notas.length +
    banco.historico.length +
    banco.anexos.length +
    banco.pesquisas.length +
    banco.notificacoes.length +
    banco.solicitacoes.length +
    banco.mensagensAtendimento.length;

  const doCasoDemo = (x: { id: string; caso_id: string }) => ehDemo(x.id) || demoCasos.has(x.caso_id);
  banco.casos = banco.casos.filter((c) => !ehDemo(c.id));
  banco.mensagens = banco.mensagens.filter((x) => !doCasoDemo(x));
  banco.notas = banco.notas.filter((x) => !doCasoDemo(x));
  banco.historico = banco.historico.filter((x) => !doCasoDemo(x));
  banco.anexos = banco.anexos.filter((x) => !doCasoDemo(x));
  banco.pesquisas = banco.pesquisas.filter((x) => !doCasoDemo(x));
  banco.notificacoes = banco.notificacoes.filter((x) => !doCasoDemo(x));
  const demoSolicitacoes = new Set(banco.solicitacoes.filter((x) => ehDemo(x.id)).map((x) => x.id));
  banco.solicitacoes = banco.solicitacoes.filter((x) => !ehDemo(x.id));
  banco.mensagensAtendimento = banco.mensagensAtendimento.filter((x) => !demoSolicitacoes.has(x.solicitacao_id));

  const depois =
    banco.casos.length +
    banco.mensagens.length +
    banco.notas.length +
    banco.historico.length +
    banco.anexos.length +
    banco.pesquisas.length +
    banco.notificacoes.length +
    banco.solicitacoes.length +
    banco.mensagensAtendimento.length;
  return depois !== antes;
}
