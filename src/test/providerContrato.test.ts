import { describe, it, expect, beforeEach } from "vitest";
import { localProvider as p } from "@/data/localProvider";
import type { RascunhoRelato } from "@/dominio/tipos";

/**
 * Suíte de contrato do DataProvider. Hoje roda contra o localProvider; quando o
 * Supabase existir, a MESMA suíte roda contra o supabaseProvider e prova a paridade.
 */

const rascunhoBase: RascunhoRelato = {
  categoria: "assedio_sexual",
  urgencia: "alta",
  relato: "Relato de teste com detalhes suficientes para passar na validação.",
  quer_retorno: true,
  anexo: null,
};

beforeEach(() => {
  localStorage.clear();
});

describe("DataProvider (contrato)", () => {
  it("criarCaso valida relato muito curto", async () => {
    await expect(p.criarCaso({ ...rascunhoBase, relato: "curto" })).rejects.toThrow();
  });

  it("ciclo de vida completo de um caso", async () => {
    const { protocolo, caso_id } = await p.criarCaso(rascunhoBase);
    expect(protocolo).toMatch(/^CE-\d{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);

    // consulta pública encontra e mostra o essencial
    const pub = await p.consultarCaso(protocolo);
    expect(pub).not.toBeNull();
    expect(pub!.status).toBe("recebido");
    expect(pub!.categoriaRotulo).toBe("Assédio sexual");
    expect(pub!.mensagens).toHaveLength(0);

    // protocolo inexistente => null genérico
    expect(await p.consultarCaso("CE-2026-ZZZZ-ZZZZ")).toBeNull();

    // urgência alta gerou notificação imediata na caixa de saída
    const fila = await p.listarNotificacoes();
    expect(fila.some((n) => n.protocolo === protocolo && n.regra === "imediato")).toBe(true);

    // mensagem anônima
    await p.enviarMensagemAnonima(protocolo, "Aconteceu na sexta.");
    const pub2 = await p.consultarCaso(protocolo);
    expect(pub2!.mensagens).toHaveLength(1);
    expect(pub2!.mensagens[0].remetente).toBe("anonimo");

    // aparece no painel
    const painel = await p.getDadosPainel();
    expect(painel.casos.some((c) => c.id === caso_id)).toBe(true);

    // equipe responde => status vai a em_andamento
    await p.responderCaso(caso_id, "Obrigada pelo relato.");
    let det = await p.getCasoDetalhe(caso_id);
    expect(det.caso.status).toBe("em_andamento");
    expect(det.mensagens).toHaveLength(2);

    // encaminhar e encerrar
    await p.encaminharCaso(caso_id, "Márcia");
    det = await p.getCasoDetalhe(caso_id);
    expect(det.caso.encaminhado).toBe(true);

    await p.encerrarCaso(caso_id, "Márcia");
    det = await p.getCasoDetalhe(caso_id);
    expect(det.caso.status).toBe("concluido");
    expect(det.caso.encerrado_em).toBeTruthy();
    expect(det.historico.length).toBeGreaterThanOrEqual(3);

    // pesquisa de encerramento liberada e idempotente
    const pub3 = await p.consultarCaso(protocolo);
    expect(pub3!.pesquisaLiberada).toBe(true);
    await p.responderPesquisa(protocolo, "ouvido", "Fui levada a sério.");
    await p.responderPesquisa(protocolo, "nao_ouvido", "duplicada, deve ser ignorada");
    const pub4 = await p.consultarCaso(protocolo);
    expect(pub4!.pesquisaRespondida).toBe(true);
    const painelFinal = await p.getDadosPainel();
    expect(painelFinal.pesquisas.filter((s) => s.caso_id === caso_id)).toHaveLength(1);
  });

  it("reclassificar gravidade recalcula o prazo de SLA", async () => {
    const { caso_id } = await p.criarCaso({ ...rascunhoBase, categoria: "sugestao_melhoria", urgencia: "baixa" });
    const antes = (await p.getCasoDetalhe(caso_id)).caso.sla_prazo;
    await p.reclassificarCaso(caso_id, { gravidade: "critica" }, "Márcia");
    const depois = (await p.getCasoDetalhe(caso_id)).caso.sla_prazo;
    expect(new Date(depois).getTime()).toBeLessThan(new Date(antes).getTime());
  });

  it("configurações persistem", async () => {
    await p.salvarConfiguracoes({ nome_canal: "Canal X" });
    expect((await p.getConfiguracoes()).nome_canal).toBe("Canal X");
    const pub = await p.getConfigPublica();
    expect(pub.nome_canal).toBe("Canal X");
  });

  it("Atendimento Psicológico fica fora de `casos` — nunca vaza um nome pro fluxo anônimo", async () => {
    await p.criarCaso(rascunhoBase);
    await p.criarSolicitacaoAtendimento({
      nome: "Ana Teste",
      setor: "Comercial",
      necessidade: "Gostaria de conversar sobre uma situação pessoal.",
    });

    const painel = await p.getDadosPainel();
    // nenhum objeto Caso tem chave `nome` (o tipo nem declara isso — este
    // teste prova em runtime, não só em compile-time).
    for (const caso of painel.casos) {
      expect(caso).not.toHaveProperty("nome");
    }

    const solicitacoes = await p.listarSolicitacoesAtendimento();
    expect(solicitacoes.some((s) => s.nome === "Ana Teste")).toBe(true);
    // a solicitação não aparece na lista de casos (entidades separadas)
    expect(painel.casos.some((c: any) => c.nome === "Ana Teste")).toBe(false);
  });

  it("mudarStatusSolicitacao avança o status e marca atendido_em ao concluir", async () => {
    await p.criarSolicitacaoAtendimento({
      nome: "Bruno Teste",
      setor: "Operacional",
      necessidade: "Preciso de ajuda com ansiedade no trabalho.",
    });
    const [sol] = await p.listarSolicitacoesAtendimento();
    expect(sol.status).toBe("nova");
    expect(sol.atendido_em).toBeNull();

    await p.mudarStatusSolicitacao(sol.id, "em_contato");
    const atualizada = (await p.listarSolicitacoesAtendimento()).find((s) => s.id === sol.id)!;
    expect(atualizada.status).toBe("em_contato");
    expect(atualizada.atendido_em).toBeNull();

    await p.mudarStatusSolicitacao(sol.id, "concluida");
    const concluida = (await p.listarSolicitacoesAtendimento()).find((s) => s.id === sol.id)!;
    expect(concluida.status).toBe("concluida");
    expect(concluida.atendido_em).toBeTruthy();
  });

  it("banco novo começa vazio: sem casos, mensagens nem pedidos de exemplo", async () => {
    const painel = await p.getDadosPainel();
    expect(painel.casos).toHaveLength(0);
    expect(painel.mensagens).toHaveLength(0);
    expect(await p.listarSolicitacoesAtendimento()).toHaveLength(0);
    expect(await p.listarNotificacoes()).toHaveLength(0);
  });

  it("Atendimento: código AP-, conversa nos dois sentidos e status automático", async () => {
    const { codigo } = await p.criarSolicitacaoAtendimento({
      nome: "Carla Teste",
      setor: "Administrativo",
      necessidade: "Preciso conversar sobre um momento difícil.",
      contato: "carla@exemplo.com",
    });
    expect(codigo).toMatch(/^AP-\d{4}-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}$/);

    const [sol] = await p.listarSolicitacoesAtendimento();
    expect(sol.codigo).toBe(codigo);
    expect(sol.contato).toBe("carla@exemplo.com");
    expect(sol.status).toBe("nova");

    // visão pública: sem mensagens ainda, e NUNCA devolve nome/setor/contato
    const pub = await p.consultarAtendimento(codigo.toLowerCase().replace(/-/g, " "));
    expect(pub).not.toBeNull();
    expect(pub!.mensagens).toHaveLength(0);
    expect(pub).not.toHaveProperty("nome");
    expect(pub).not.toHaveProperty("setor");
    expect(pub).not.toHaveProperty("contato");

    // equipe responde: nova -> em_contato automático
    await p.responderAtendimento(sol.id, "Oi, Carla. Podemos conversar amanhã às 10h?");
    const depois = (await p.listarSolicitacoesAtendimento()).find((s) => s.id === sol.id)!;
    expect(depois.status).toBe("em_contato");

    // pessoa lê e responde só com o código
    const pub2 = await p.consultarAtendimento(codigo);
    expect(pub2!.mensagens.map((m) => m.remetente)).toEqual(["equipe"]);
    await p.enviarMensagemAtendimento(codigo, "Pode ser, obrigada.");
    const msgs = await p.listarMensagensAtendimento(sol.id);
    expect(msgs.map((m) => m.remetente)).toEqual(["equipe", "pessoa"]);

    // código inexistente ou de relato (CE-) não abre atendimento
    expect(await p.consultarAtendimento("AP-2026-ZZZZ-ZZZZ-ZZZZ")).toBeNull();
    expect(await p.consultarAtendimento("CE-2026-ZZZZ-ZZZZ")).toBeNull();

    // encerrado: pessoa não consegue mais escrever
    await p.mudarStatusSolicitacao(sol.id, "concluida");
    expect((await p.consultarAtendimento(codigo))!.permiteResponder).toBe(false);
    await expect(p.enviarMensagemAtendimento(codigo, "Mais uma coisa")).rejects.toThrow();
  });

  it("mensagens de Atendimento não entram no corpus anônimo (mensagens de casos)", async () => {
    const { codigo } = await p.criarSolicitacaoAtendimento({
      nome: "Dora Teste",
      setor: "Comercial",
      necessidade: "Quero apoio psicológico, por favor.",
    });
    await p.enviarMensagemAtendimento(codigo, "Mensagem da pessoa identificada.");
    const painel = await p.getDadosPainel();
    expect(painel.mensagens).toHaveLength(0);
  });
});
