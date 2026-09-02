import type {
  Anexo,
  Caso,
  CategoriaId,
  ConfiguracoesCanal,
  Empresa,
  HistoricoStatus,
  MensagemCaso,
  NotaInterna,
  NotificacaoFila,
  PesquisaEncerramento,
  StatusCaso,
} from "@/dominio/tipos";
import { CATEGORIAS, categoriaMeta } from "@/dominio/categorias";
import { calcularPrazoSla } from "@/dominio/sla";
import { gerarProtocolo } from "@/dominio/protocolo";
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
}

const AGORA = Date.now();
const DIA = 24 * 60 * 60 * 1000;
/** ISO de `offsetDias` atras, ancorado ~10h da manha para ficar legivel. */
const iso = (offsetDias: number) => {
  const d = new Date(AGORA - offsetDias * DIA);
  d.setUTCHours(13, 0, 0, 0);
  return d.toISOString();
};

let n = 0;
const id = (p: string) => `${p}_${(++n).toString(36)}_seed`;

export const PROTOCOLO_DEMO = "CE-2026-7F3K-M2QD";

const MENSAGEM_BOAS_VINDAS =
  "Você pode relatar sem se identificar. Não registramos seu nome, seu IP ou o aparelho que você está usando — só o que você quiser contar.";

function novoHistorico(casoId: string, de: StatusCaso | null, para: StatusCaso, quando: string, quem: string): HistoricoStatus {
  return {
    id: id("hist"),
    caso_id: casoId,
    empresa_id: EMPRESA_ID,
    status_anterior: de,
    status_novo: para,
    responsavel: quem,
    criado_em: quando,
  };
}

export function criarBancoInicial(): BancoLocal {
  n = 0;
  const empresa: Empresa = {
    id: EMPRESA_ID,
    nome: "Empresa Demonstração",
    dominio: "escuta.empresa.com.br",
    criado_em: iso(240),
  };

  const config: ConfiguracoesCanal = {
    empresa_id: EMPRESA_ID,
    nome_canal: "Canal de Escuta",
    dominio: "escuta.empresa.com.br",
    mensagem_boas_vindas: MENSAGEM_BOAS_VINDAS,
    categorias_ativas: CATEGORIAS.map((c) => c.id),
    permitir_anexos: true,
    permitir_mensagens_pos_encerramento: false,
    pesquisa_encerramento_ativa: true,
    atualizado_em: iso(30),
  };

  const casos: Caso[] = [];
  const mensagens: MensagemCaso[] = [];
  const notas: NotaInterna[] = [];
  const historico: HistoricoStatus[] = [];
  const pesquisas: PesquisaEncerramento[] = [];
  const notificacoes: NotificacaoFila[] = [];
  const anexos: Anexo[] = [];

  const EQUIPE = "Márcia Bússolo";

  function addCaso(args: {
    protocolo: string;
    categoria: CategoriaId;
    status: StatusCaso;
    criadoDiasAtras: number;
    setor: string | null;
    relato: string;
    encaminhado?: boolean;
    gravidadeForcada?: Caso["gravidade"];
    urgenciaAlta?: boolean;
  }): Caso {
    const criado_em = iso(args.criadoDiasAtras);
    const gravidade =
      args.gravidadeForcada ??
      (args.urgenciaAlta ? "critica" : categoriaMeta(args.categoria).gravidadePadrao);
    const concluido = args.status === "concluido";
    const caso: Caso = {
      id: id("caso"),
      empresa_id: EMPRESA_ID,
      protocolo: args.protocolo,
      categoria: args.categoria,
      gravidade,
      status: args.status,
      urgencia: args.urgenciaAlta ? "alta" : "baixa",
      canal_origem: "pwa",
      setor: args.setor,
      relato: args.relato,
      quer_retorno: true,
      encaminhado: !!args.encaminhado,
      criado_em,
      atualizado_em: concluido ? iso(Math.max(0, args.criadoDiasAtras - 4)) : criado_em,
      sla_prazo: calcularPrazoSla(criado_em, gravidade),
      encerrado_em: concluido ? iso(Math.max(0, args.criadoDiasAtras - 4)) : null,
    };
    casos.push(caso);
    historico.push(novoHistorico(caso.id, null, "recebido", criado_em, "sistema"));
    if (args.status !== "recebido") {
      historico.push(
        novoHistorico(caso.id, "recebido", args.status, iso(Math.max(0, args.criadoDiasAtras - 1)), EQUIPE),
      );
    }
    return caso;
  }

  // ---------- os 5 casos do prototipo ----------
  const c1 = addCaso({
    protocolo: PROTOCOLO_DEMO,
    categoria: "assedio_moral",
    status: "em_andamento",
    criadoDiasAtras: 8,
    setor: "Operacional",
    relato:
      "Comentários públicos e recorrentes de um gestor sobre o desempenho de um subordinado durante reuniões de equipe, gerando constrangimento na frente dos colegas.",
  });
  mensagens.push(
    {
      id: id("msg"),
      caso_id: c1.id,
      empresa_id: EMPRESA_ID,
      remetente: "equipe",
      conteudo:
        "Obrigada por relatar. Você poderia dizer aproximadamente quando essa situação aconteceu pela última vez?",
      criado_em: iso(6),
    },
    {
      id: id("msg"),
      caso_id: c1.id,
      empresa_id: EMPRESA_ID,
      remetente: "anonimo",
      conteudo: "Foi na semana passada, numa reunião com mais pessoas.",
      criado_em: iso(5),
    },
  );
  notas.push({
    id: id("nota"),
    caso_id: c1.id,
    empresa_id: EMPRESA_ID,
    autor: EQUIPE,
    conteudo:
      "Confirmar com o gestor do setor se há outros relatos recentes envolvendo a mesma dupla antes de avançar.",
    criado_em: iso(5),
  });

  const c2 = addCaso({
    protocolo: "CE-2026-A91Z-K4TN",
    categoria: "assedio_sexual",
    status: "triagem",
    criadoDiasAtras: 5,
    setor: "Comercial",
    relato:
      "Comentários de conotação sexual reiterados por um colega de setor, mesmo após pedido explícito para que parassem.",
    urgenciaAlta: true,
  });
  // SLA critica de 5 dias atras ja venceu
  c2.sla_prazo = iso(1);

  addCaso({
    protocolo: "CE-2026-3M0P-Q8RD",
    categoria: "sugestao_melhoria",
    status: "recebido",
    criadoDiasAtras: 2,
    setor: "Administrativo",
    relato:
      "Sugestão de revisão da escala de plantões aos sábados, apontada como fonte recorrente de desgaste pela equipe do turno da tarde.",
  });

  addCaso({
    protocolo: "CE-2026-Q7LD-T2W9",
    categoria: "sobrecarga",
    status: "triagem",
    criadoDiasAtras: 6,
    setor: "Operacional",
    relato:
      "Acúmulo de funções após o desligamento de um colega sem reposição, com jornada estendida sem compensação combinada previamente.",
  });

  const c5 = addCaso({
    protocolo: "CE-2026-X22R-J9FP",
    categoria: "discriminacao",
    status: "concluido",
    criadoDiasAtras: 20,
    setor: "Comercial",
    relato:
      "Comentários discriminatórios recorrentes associados a origem regional durante o horário de trabalho.",
    encaminhado: true,
    urgenciaAlta: true,
  });
  mensagens.push({
    id: id("msg"),
    caso_id: c5.id,
    empresa_id: EMPRESA_ID,
    remetente: "equipe",
    conteudo:
      "Seu caso foi encaminhado ao RH/jurídico da empresa e encerrado do nosso lado, mantendo o acompanhamento psicológico. Obrigada por confiar no canal.",
    criado_em: iso(17),
  });
  pesquisas.push({
    id: id("pesq"),
    caso_id: c5.id,
    empresa_id: EMPRESA_ID,
    avaliacao: "ouvido",
    comentario: "Fui levada a sério e senti que algo foi feito.",
    criado_em: iso(15),
  });

  // ---------- historico para a tendencia mensal e indicadores ----------
  const categoriasPool: CategoriaId[] = [
    "assedio_moral",
    "assedio_moral",
    "sobrecarga",
    "conflito_colega",
    "falta_reconhecimento",
    "sugestao_melhoria",
    "discriminacao",
    "seguranca_trabalho",
  ];
  const setores = ["Operacional", "Comercial", "Administrativo", null];
  const avaliacoes: PesquisaEncerramento["avaliacao"][] = ["ouvido", "ouvido", "em_parte", "ouvido", "nao_ouvido"];
  let ap = 0;

  const porMes = [18, 33, 48, 63, 78, 93, 108, 123, 138];
  porMes.forEach((diasAtras, i) => {
    const cat = categoriasPool[i % categoriasPool.length];
    const caso = addCaso({
      protocolo: gerarProtocolo(2026),
      categoria: cat,
      status: "concluido",
      criadoDiasAtras: diasAtras,
      setor: setores[i % setores.length],
      relato: "Relato de exemplo do histórico, encerrado no mês correspondente.",
    });
    mensagens.push({
      id: id("msg"),
      caso_id: caso.id,
      empresa_id: EMPRESA_ID,
      remetente: "equipe",
      conteudo: "Recebemos seu relato e demos andamento. Obrigada.",
      criado_em: iso(diasAtras - 2),
    });
    if (i % 3 !== 0) {
      pesquisas.push({
        id: id("pesq"),
        caso_id: caso.id,
        empresa_id: EMPRESA_ID,
        avaliacao: avaliacoes[ap++ % avaliacoes.length],
        comentario: null,
        criado_em: iso(diasAtras - 3),
      });
    }
  });

  // ---------- fila de notificacoes (aba Alertas) ----------
  for (const caso of casos) {
    const meta = categoriaMeta(caso.categoria);
    const regra = caso.urgencia === "alta" ? "imediato" : meta.regra;
    if (regra !== "imediato") continue;
    notificacoes.push({
      id: id("notif"),
      empresa_id: EMPRESA_ID,
      caso_id: caso.id,
      protocolo: caso.protocolo,
      canal: "email",
      destinatario: "equipe-escuta@empresa.com.br",
      assunto: `[Canal de Escuta] Novo caso ${meta.rotulo} — ${caso.protocolo}`,
      corpo:
        `Um novo relato entrou e se enquadra na regra de aviso imediato.\n\n` +
        `Protocolo: ${caso.protocolo}\nCategoria: ${meta.rotulo}\nGravidade: ${caso.gravidade}\n` +
        `Abra o painel para triagem.`,
      regra: "imediato",
      criado_em: caso.criado_em,
      enviado: true,
    });
  }

  return { empresa, config, casos, mensagens, notas, historico, anexos, pesquisas, notificacoes };
}
