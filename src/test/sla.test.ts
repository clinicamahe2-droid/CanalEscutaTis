import { describe, it, expect } from "vitest";
import {
  somarDiasUteis,
  calcularPrazoSla,
  diasUteisEntre,
  situacaoSla,
} from "@/dominio/sla";

describe("SLA", () => {
  it("somarDiasUteis nunca cai em fim de semana e soma 5 = próxima semana", () => {
    // varre 40 datas de partida
    for (let i = 0; i < 40; i++) {
      const base = new Date("2026-01-01T12:00:00.000Z");
      base.setUTCDate(base.getUTCDate() + i);
      const r1 = somarDiasUteis(base, 1);
      expect([0, 6]).not.toContain(r1.getUTCDay());
      const r5 = somarDiasUteis(base, 5);
      expect([0, 6]).not.toContain(r5.getUTCDay());
      // 5 dias úteis a partir de uma segunda = segunda seguinte
      if (base.getUTCDay() === 1) {
        expect(r5.getUTCDay()).toBe(1);
        expect(Math.round((r5.getTime() - base.getTime()) / 86400000)).toBe(7);
      }
    }
  });

  it("calcularPrazoSla: crítica ~1 dia útil, baixa ~10", () => {
    const base = "2026-09-01T12:00:00.000Z"; // terça
    const critica = new Date(calcularPrazoSla(base, "critica"));
    const baixa = new Date(calcularPrazoSla(base, "baixa"));
    expect(critica.getTime()).toBeLessThan(baixa.getTime());
    expect(diasUteisEntre(new Date(base), baixa)).toBe(10);
  });

  it("situacaoSla marca vencido quando o prazo já passou", () => {
    const ontem = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
    const s = situacaoSla(ontem, "em_andamento");
    expect(s.vencido).toBe(true);
  });

  it("situacaoSla ignora prazo de caso concluído", () => {
    const ontem = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
    const s = situacaoSla(ontem, "concluido");
    expect(s.vencido).toBe(false);
    expect(s.rotulo).toBe("Encerrado");
  });

  it("situacaoSla conta dias úteis restantes quando dentro do prazo", () => {
    const futuro = new Date(Date.now() + 20 * 24 * 3600 * 1000).toISOString();
    const s = situacaoSla(futuro, "triagem");
    expect(s.vencido).toBe(false);
    expect(s.diasRestantes).toBeGreaterThan(0);
  });
});
