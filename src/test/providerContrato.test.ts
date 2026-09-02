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
});
