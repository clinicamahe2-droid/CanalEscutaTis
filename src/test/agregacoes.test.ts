import { describe, it, expect } from "vitest";
import {
  indicadoresGerais,
  mapaDeRisco,
  tendenciaMensal,
  resumoMensal,
} from "@/dominio/agregacoes";
import type { Caso, MensagemCaso, PesquisaEncerramento } from "@/dominio/tipos";
import { calcularPrazoSla } from "@/dominio/sla";

function caso(over: Partial<Caso>): Caso {
  const criado_em = over.criado_em ?? new Date().toISOString();
  return {
    id: Math.random().toString(36).slice(2),
    empresa_id: "e1",
    protocolo: "CE-2026-AAAA-BBBB",
    categoria: "assedio_moral",
    gravidade: "media",
    status: "recebido",
    urgencia: "baixa",
    canal_origem: "pwa",
    setor: null,
    relato: "x",
    quer_retorno: true,
    encaminhado: false,
    criado_em,
    atualizado_em: criado_em,
    sla_prazo: calcularPrazoSla(criado_em, over.gravidade ?? "media"),
    encerrado_em: null,
    ...over,
  };
}

describe("agregações", () => {
  it("indicadoresGerais: abertos, fora do prazo e % ouvido", () => {
    const antigo = new Date(Date.now() - 40 * 864e5).toISOString();
    const casos: Caso[] = [
      caso({ id: "a", status: "recebido" }),
      caso({ id: "b", status: "em_andamento" }),
      caso({ id: "c", status: "concluido" }),
      caso({ id: "d", status: "triagem", criado_em: antigo, sla_prazo: antigo }),
    ];
    const mensagens: MensagemCaso[] = [
      { id: "m1", caso_id: "b", empresa_id: "e1", remetente: "equipe", conteudo: "oi", criado_em: new Date().toISOString() },
    ];
    const pesquisas: PesquisaEncerramento[] = [
      { id: "p1", caso_id: "c", empresa_id: "e1", avaliacao: "ouvido", comentario: null, criado_em: new Date().toISOString() },
      { id: "p2", caso_id: "c", empresa_id: "e1", avaliacao: "em_parte", comentario: null, criado_em: new Date().toISOString() },
    ];
    const ind = indicadoresGerais(casos, mensagens, pesquisas);
    expect(ind.casosAbertos).toBe(3);
    expect(ind.casosForaDoPrazo).toBe(1);
    expect(ind.percentualOuvido).toBe(50);
    expect(ind.totalRelatos).toBe(4);
  });

  it("mapaDeRisco ordena da categoria mais frequente para a menos", () => {
    const casos = [
      caso({ categoria: "sobrecarga" }),
      caso({ categoria: "sobrecarga" }),
      caso({ categoria: "discriminacao" }),
    ];
    const m = mapaDeRisco(casos);
    expect(m[0].categoria).toBe("sobrecarga");
    expect(m[0].total).toBe(2);
    expect(m[0].proporcao).toBe(100);
    expect(m[1].proporcao).toBe(50);
  });

  it("tendenciaMensal devolve 6 baldes contíguos e conta no mês certo", () => {
    const ref = new Date("2026-09-15T12:00:00.000Z");
    const casos = [
      caso({ criado_em: "2026-09-02T10:00:00.000Z" }),
      caso({ criado_em: "2026-08-20T10:00:00.000Z" }),
      caso({ criado_em: "2026-08-01T10:00:00.000Z" }),
    ];
    const t = tendenciaMensal(casos, 6, ref);
    expect(t).toHaveLength(6);
    expect(t[5].chave).toBe("2026-09");
    expect(t[5].total).toBe(1);
    expect(t[4].chave).toBe("2026-08");
    expect(t[4].total).toBe(2);
  });

  it("resumoMensal filtra pelo mês de referência", () => {
    const ref = new Date("2026-09-15T12:00:00.000Z");
    const casos = [
      caso({ criado_em: "2026-09-10T10:00:00.000Z", status: "recebido" }),
      caso({ criado_em: "2026-07-10T10:00:00.000Z", status: "concluido" }),
    ];
    const r = resumoMensal(casos, [], ref);
    expect(r.totalRelatos).toBe(1);
    expect(r.emAberto).toBe(1);
  });
});
