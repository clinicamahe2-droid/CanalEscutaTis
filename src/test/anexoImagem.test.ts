import { describe, it, expect } from "vitest";
import { sanitizarAnexoImagem, AnexoInvalidoError } from "@/lib/anexoImagem";

function arquivoFalso(tipo: string, tamanho: number): File {
  const partes = [new Uint8Array(Math.min(tamanho, 1024))];
  const f = new File(partes, "foto-original.jpg", { type: tipo });
  Object.defineProperty(f, "size", { value: tamanho });
  return f;
}

describe("sanitização de anexo", () => {
  it("recusa formato que não é imagem", async () => {
    await expect(sanitizarAnexoImagem(arquivoFalso("application/pdf", 1000))).rejects.toBeInstanceOf(
      AnexoInvalidoError,
    );
  });

  it("recusa imagem acima do limite de entrada", async () => {
    await expect(
      sanitizarAnexoImagem(arquivoFalso("image/jpeg", 20 * 1024 * 1024)),
    ).rejects.toBeInstanceOf(AnexoInvalidoError);
  });
});
