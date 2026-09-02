/**
 * Sanitizacao de anexo de imagem.
 *
 * Anonimato: o arquivo bruto carrega EXIF (modelo do aparelho, data, e as vezes
 * GPS) e o nome original ("foto-joao-rh.jpg") identifica tanto quanto o EXIF.
 * Aqui o arquivo e redesenhado num <canvas> e re-exportado como JPEG — o canvas
 * nao propaga EXIF —, redimensionado, e renomeado para um nome neutro.
 *
 * So imagens: jpeg/png/webp. PDF/DOCX carregam metadado de autor que o
 * navegador nao limpa, entao sao recusados.
 */

export const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
export const TAMANHO_MAX_ENTRADA = 12 * 1024 * 1024; // 12 MB no arquivo original
const LADO_MAX = 1600;
const QUALIDADE = 0.82;

export interface AnexoSanitizado {
  blob: Blob;
  nome: string;
  tipo: string;
  tamanho: number;
  largura: number;
  altura: number;
}

export class AnexoInvalidoError extends Error {}

function carregarImagem(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new AnexoInvalidoError("Nao foi possivel ler a imagem."));
    };
    img.src = url;
  });
}

export async function sanitizarAnexoImagem(file: File): Promise<AnexoSanitizado> {
  if (!TIPOS_ACEITOS.includes(file.type)) {
    throw new AnexoInvalidoError("Formato nao aceito. Envie uma imagem JPG, PNG ou WEBP.");
  }
  if (file.size > TAMANHO_MAX_ENTRADA) {
    throw new AnexoInvalidoError("Imagem muito grande. O limite e 12 MB.");
  }

  const img = await carregarImagem(file);
  const escala = Math.min(1, LADO_MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const largura = Math.max(1, Math.round(img.naturalWidth * escala));
  const altura = Math.max(1, Math.round(img.naturalHeight * escala));

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new AnexoInvalidoError("Canvas indisponivel neste navegador.");
  ctx.drawImage(img, 0, 0, largura, altura);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALIDADE),
  );
  if (!blob) throw new AnexoInvalidoError("Falha ao processar a imagem.");

  return {
    blob,
    nome: "anexo-1.jpg",
    tipo: "image/jpeg",
    tamanho: blob.size,
    largura,
    altura,
  };
}
