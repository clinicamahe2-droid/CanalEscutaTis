import { describe, it, expect } from "vitest";
import {
  gerarProtocolo,
  normalizarProtocolo,
  protocoloValido,
  PROTOCOLO_REGEX,
} from "@/dominio/protocolo";

describe("protocolo", () => {
  it("gera no formato CE-AAAA-XXXX-XXXX", () => {
    const p = gerarProtocolo(2026);
    expect(p).toMatch(PROTOCOLO_REGEX);
    expect(p.startsWith("CE-2026-")).toBe(true);
  });

  it("nunca usa caracteres ambíguos (0 1 I L O U)", () => {
    for (let i = 0; i < 500; i++) {
      const corpo = gerarProtocolo(2026).slice(8);
      expect(corpo).not.toMatch(/[01ILOU]/);
    }
  });

  it("10.000 gerações sem colisão e todas no formato", () => {
    const vistos = new Set<string>();
    for (let i = 0; i < 10_000; i++) {
      const p = gerarProtocolo(2026);
      expect(p).toMatch(PROTOCOLO_REGEX);
      expect(vistos.has(p)).toBe(false);
      vistos.add(p);
    }
    expect(vistos.size).toBe(10_000);
  });

  it("normaliza entrada suja para a forma canônica", () => {
    expect(normalizarProtocolo("ce 2026 7f3k m2qd")).toBe("CE-2026-7F3K-M2QD");
    expect(normalizarProtocolo("CE-2026-7F3KM2QD")).toBe("CE-2026-7F3K-M2QD");
    expect(normalizarProtocolo("  ce2026-7f3k-m2qd ")).toBe("CE-2026-7F3K-M2QD");
  });

  it("rejeita códigos incompletos ou fora do formato", () => {
    expect(protocoloValido("CE-2026-7F3K")).toBe(false);
    expect(protocoloValido("lixo")).toBe(false);
    expect(protocoloValido("")).toBe(false);
    expect(protocoloValido(gerarProtocolo(2026))).toBe(true);
  });
});
