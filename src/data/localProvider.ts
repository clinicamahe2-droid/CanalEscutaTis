import type {
  Anexo,
  Caso,
  ConfiguracoesCanal,
  MensagemCaso,
  NotaInterna,
  NotificacaoFila,
  PesquisaEncerramento,
  RascunhoRelato,
  ResultadoCriacaoCaso,
  StatusCaso,
  AvaliacaoEncerramento,
  CategoriaId,
  Gravidade,
} from "@/dominio/tipos";
import { categoriaMeta, rotuloCategoria } from "@/dominio/categorias";
import { calcularPrazoSla } from "@/dominio/sla";
import { gerarProtocolo, normalizarProtocolo } from "@/dominio/protocolo";
import {
  EMPRESA_ID,
  type CasoDetalheEquipe,
  type CasoPublico,
  type ConfigPublica,
  type DadosPainel,
  type DataProvider,
} from "./DataProvider";
import { ler, gravar } from "./armazenamento";
import { lerAnexoBlob } from "./anexosDb";
import { criarBancoInicial, type BancoLocal } from "./seed";

const CHAVE_BANCO = "banco";

function carregar(): BancoLocal {
  const existente = ler<BancoLocal | null>(CHAVE_BANCO, null);
  if (existente && Array.isArray(existente.casos) && existente.config) return existente;
  const novo = criarBancoInicial();
  gravar(CHAVE_BANCO, novo);
  return novo;
}

function salvar(banco: BancoLocal): void {
  gravar(CHAVE_BANCO, banco);
}

function uid(p: string): string {
  return `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function agoraIso(): string {
  return new Date().toISOString();
}

function gravidadeDe(categoria: CategoriaId, urgenciaAlta: boolean): Gravidade {
  if (urgenciaAlta) return "critica";
  return categoriaMeta(categoria).gravidadePadrao;
}

function protocoloPublico(banco: BancoLocal, caso: Caso, config: ConfiguracoesCanal): CasoPublico {
  const mensagens = banco.mensagens
    .filter((m) => m.caso_id === caso.id)
    .sort((a, b) => a.criado_em.localeCompare(b.criado_em))
    .map((m) => ({ remetente: m.remetente, conteudo: m.conteudo, criado_em: m.criado_em }));
  const pesquisa = banco.pesquisas.find((p) => p.caso_id === caso.id) ?? null;
  const concluido = caso.status === "concluido";
  return {
    protocolo: caso.protocolo,
    categoriaRotulo: rotuloCategoria(caso.categoria),
    status: caso.status,
    criado_em: caso.criado_em,
    quer_retorno: caso.quer_retorno,
    mensagens,
    permiteResponder: !concluido || config.permitir_mensagens_pos_encerramento,
    pesquisaLiberada: concluido && config.pesquisa_encerramento_ativa && !pesquisa,
    pesquisaRespondida: !!pesquisa,
  };
}

function acharPorProtocolo(banco: BancoLocal, protocolo: string): Caso | undefined {
  const alvo = normalizarProtocolo(protocolo);
  return banco.casos.find((c) => c.protocolo === alvo && c.empresa_id === EMPRESA_ID);
}

function registrarNotificacao(banco: BancoLocal, caso: Caso) {
  const meta = categoriaMeta(caso.categoria);
  const regra = caso.urgencia === "alta" ? "imediato" : meta.regra;
  banco.notificacoes.unshift({
    id: uid("notif"),
    empresa_id: EMPRESA_ID,
    caso_id: caso.id,
    protocolo: caso.protocolo,
    canal: "email",
    destinatario: "equipe-escuta@empresa.com.br",
    assunto: `[Canal de Escuta] Novo caso ${meta.rotulo} — ${caso.protocolo}`,
    corpo:
      `Um novo relato entrou pelo canal.\n\n` +
      `Protocolo: ${caso.protocolo}\nCategoria: ${meta.rotulo}\nGravidade: ${caso.gravidade}\n` +
      `Regra de aviso: ${regra}\n\nAbra o painel para dar andamento.`,
    regra,
    criado_em: agoraIso(),
    enviado: regra === "imediato",
  });
}

function novoHistorico(
  casoId: string,
  de: StatusCaso | null,
  para: StatusCaso,
  responsavel: string,
) {
  return {
    id: uid("hist"),
    caso_id: casoId,
    empresa_id: EMPRESA_ID,
    status_anterior: de,
    status_novo: para,
    responsavel,
    criado_em: agoraIso(),
  };
}

export const localProvider: DataProvider = {
  async getConfigPublica(): Promise<ConfigPublica> {
    const { config } = carregar();
    return {
      nome_canal: config.nome_canal,
      mensagem_boas_vindas: config.mensagem_boas_vindas,
      categorias_ativas: config.categorias_ativas,
      permitir_anexos: config.permitir_anexos,
    };
  },

  async criarCaso(rascunho: RascunhoRelato): Promise<ResultadoCriacaoCaso> {
    if (!rascunho.categoria) throw new Error("Categoria obrigatória.");
    if (!rascunho.relato || rascunho.relato.trim().length < 10) {
      throw new Error("O relato precisa ter ao menos 10 caracteres.");
    }
    const banco = carregar();

    let protocolo = "";
    for (let tentativa = 0; tentativa < 6; tentativa++) {
      const cand = gerarProtocolo();
      if (!banco.casos.some((c) => c.protocolo === cand)) {
        protocolo = cand;
        break;
      }
    }
    if (!protocolo) throw new Error("Não foi possível gerar um protocolo. Tente de novo.");

    const criado_em = agoraIso();
    const urgenciaAlta = rascunho.urgencia === "alta";
    const gravidade = gravidadeDe(rascunho.categoria, urgenciaAlta);
    const caso: Caso = {
      id: uid("caso"),
      empresa_id: EMPRESA_ID,
      protocolo,
      categoria: rascunho.categoria,
      gravidade,
      status: "recebido",
      urgencia: urgenciaAlta ? "alta" : "baixa",
      canal_origem: "pwa",
      setor: null,
      relato: rascunho.relato.trim(),
      quer_retorno: rascunho.quer_retorno,
      encaminhado: false,
      criado_em,
      atualizado_em: criado_em,
      sla_prazo: calcularPrazoSla(criado_em, gravidade),
      encerrado_em: null,
    };
    banco.casos.unshift(caso);
    banco.historico.push(novoHistorico(caso.id, null, "recebido", "sistema"));

    if (rascunho.anexo) {
      const anexo: Anexo = {
        id: uid("anx"),
        caso_id: caso.id,
        empresa_id: EMPRESA_ID,
        storage_path: rascunho.anexo.ref,
        nome: rascunho.anexo.nome,
        tipo: rascunho.anexo.tipo,
        tamanho: rascunho.anexo.tamanho,
        criado_em,
      };
      banco.anexos.push(anexo);
    }

    registrarNotificacao(banco, caso);
    salvar(banco);
    return { protocolo, caso_id: caso.id };
  },

  async consultarCaso(protocolo: string): Promise<CasoPublico | null> {
    const banco = carregar();
    const caso = acharPorProtocolo(banco, protocolo);
    if (!caso) return null;
    return protocoloPublico(banco, caso, banco.config);
  },

  async enviarMensagemAnonima(protocolo: string, conteudo: string): Promise<void> {
    const texto = (conteudo || "").trim();
    if (!texto) throw new Error("Mensagem vazia.");
    const banco = carregar();
    const caso = acharPorProtocolo(banco, protocolo);
    if (!caso) throw new Error("Protocolo não encontrado.");
    const concluido = caso.status === "concluido";
    if (concluido && !banco.config.permitir_mensagens_pos_encerramento) {
      throw new Error("Este caso está encerrado e não aceita novas mensagens.");
    }
    banco.mensagens.push({
      id: uid("msg"),
      caso_id: caso.id,
      empresa_id: EMPRESA_ID,
      remetente: "anonimo",
      conteudo: texto,
      criado_em: agoraIso(),
    });
    caso.atualizado_em = agoraIso();
    salvar(banco);
  },

  async responderPesquisa(
    protocolo: string,
    avaliacao: AvaliacaoEncerramento,
    comentario: string,
  ): Promise<void> {
    const banco = carregar();
    const caso = acharPorProtocolo(banco, protocolo);
    if (!caso) throw new Error("Protocolo não encontrado.");
    if (caso.status !== "concluido") throw new Error("O caso ainda não foi encerrado.");
    if (banco.pesquisas.some((p) => p.caso_id === caso.id)) return; // idempotente
    banco.pesquisas.push({
      id: uid("pesq"),
      caso_id: caso.id,
      empresa_id: EMPRESA_ID,
      avaliacao,
      comentario: comentario.trim() || null,
      criado_em: agoraIso(),
    });
    salvar(banco);
  },

  async getDadosPainel(): Promise<DadosPainel> {
    const banco = carregar();
    return {
      casos: [...banco.casos].sort((a, b) => b.criado_em.localeCompare(a.criado_em)),
      mensagens: banco.mensagens,
      pesquisas: banco.pesquisas,
    };
  },

  async getCasoDetalhe(casoId: string): Promise<CasoDetalheEquipe> {
    const banco = carregar();
    const caso = banco.casos.find((c) => c.id === casoId);
    if (!caso) throw new Error("Caso não encontrado.");
    return {
      caso,
      mensagens: banco.mensagens
        .filter((m) => m.caso_id === casoId)
        .sort((a, b) => a.criado_em.localeCompare(b.criado_em)),
      notas: banco.notas
        .filter((no) => no.caso_id === casoId)
        .sort((a, b) => a.criado_em.localeCompare(b.criado_em)),
      historico: banco.historico
        .filter((h) => h.caso_id === casoId)
        .sort((a, b) => a.criado_em.localeCompare(b.criado_em)),
      anexos: banco.anexos.filter((a) => a.caso_id === casoId),
      pesquisa: banco.pesquisas.find((p) => p.caso_id === casoId) ?? null,
    };
  },

  async responderCaso(casoId: string, conteudo: string): Promise<MensagemCaso> {
    const texto = (conteudo || "").trim();
    if (!texto) throw new Error("Mensagem vazia.");
    const banco = carregar();
    const caso = banco.casos.find((c) => c.id === casoId);
    if (!caso) throw new Error("Caso não encontrado.");
    const msg: MensagemCaso = {
      id: uid("msg"),
      caso_id: casoId,
      empresa_id: EMPRESA_ID,
      remetente: "equipe",
      conteudo: texto,
      criado_em: agoraIso(),
    };
    banco.mensagens.push(msg);
    caso.atualizado_em = msg.criado_em;
    if (caso.status === "recebido") {
      banco.historico.push(novoHistorico(caso.id, "recebido", "em_andamento", "equipe"));
      caso.status = "em_andamento";
    }
    salvar(banco);
    return msg;
  },

  async adicionarNota(casoId: string, conteudo: string, autor: string): Promise<NotaInterna> {
    const texto = (conteudo || "").trim();
    if (!texto) throw new Error("Nota vazia.");
    const banco = carregar();
    if (!banco.casos.some((c) => c.id === casoId)) throw new Error("Caso não encontrado.");
    const nota: NotaInterna = {
      id: uid("nota"),
      caso_id: casoId,
      empresa_id: EMPRESA_ID,
      autor,
      conteudo: texto,
      criado_em: agoraIso(),
    };
    banco.notas.push(nota);
    salvar(banco);
    return nota;
  },

  async reclassificarCaso(
    casoId: string,
    patch: { categoria?: CategoriaId; gravidade?: Gravidade },
    _responsavel: string,
  ): Promise<Caso> {
    const banco = carregar();
    const caso = banco.casos.find((c) => c.id === casoId);
    if (!caso) throw new Error("Caso não encontrado.");
    if (patch.categoria) caso.categoria = patch.categoria;
    if (patch.gravidade && patch.gravidade !== caso.gravidade) {
      caso.gravidade = patch.gravidade;
      caso.sla_prazo = calcularPrazoSla(caso.criado_em, patch.gravidade);
    }
    caso.atualizado_em = agoraIso();
    salvar(banco);
    return caso;
  },

  async mudarStatus(casoId: string, novo: StatusCaso, responsavel: string): Promise<Caso> {
    const banco = carregar();
    const caso = banco.casos.find((c) => c.id === casoId);
    if (!caso) throw new Error("Caso não encontrado.");
    if (caso.status === novo) return caso;
    banco.historico.push(novoHistorico(caso.id, caso.status, novo, responsavel));
    caso.status = novo;
    caso.atualizado_em = agoraIso();
    caso.encerrado_em = novo === "concluido" ? agoraIso() : null;
    if (novo === "encaminhado") caso.encaminhado = true;
    salvar(banco);
    return caso;
  },

  async encaminharCaso(casoId: string, responsavel: string): Promise<Caso> {
    return localProvider.mudarStatus(casoId, "encaminhado", responsavel);
  },

  async encerrarCaso(casoId: string, responsavel: string): Promise<Caso> {
    return localProvider.mudarStatus(casoId, "concluido", responsavel);
  },

  async listarNotificacoes(): Promise<NotificacaoFila[]> {
    const banco = carregar();
    return [...banco.notificacoes].sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  },

  async getConfiguracoes(): Promise<ConfiguracoesCanal> {
    return carregar().config;
  },

  async salvarConfiguracoes(patch: Partial<ConfiguracoesCanal>): Promise<ConfiguracoesCanal> {
    const banco = carregar();
    banco.config = { ...banco.config, ...patch, empresa_id: EMPRESA_ID, atualizado_em: agoraIso() };
    salvar(banco);
    return banco.config;
  },

  async getAnexoUrl(anexo: Anexo): Promise<string | null> {
    const blob = await lerAnexoBlob(anexo.storage_path);
    return blob ? URL.createObjectURL(blob) : null;
  },

  async resetarDemo(): Promise<void> {
    const novo = criarBancoInicial();
    salvar(novo);
  },
};
