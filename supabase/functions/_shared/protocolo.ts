// Mesma logica de src/dominio/protocolo.ts — protocolo gerado NO SERVIDOR.
const ALFABETO = "23456789ABCDEFGHJKMNPQRSTVWXYZ";

function bloco(): string {
  const limite = 256 - (256 % ALFABETO.length);
  let out = "";
  while (out.length < 4) {
    const buf = new Uint8Array(8);
    crypto.getRandomValues(buf);
    for (const b of buf) {
      if (b >= limite) continue;
      out += ALFABETO[b % ALFABETO.length];
      if (out.length === 4) break;
    }
  }
  return out;
}

export function gerarProtocolo(ano = new Date().getUTCFullYear()): string {
  return `CE-${ano}-${bloco()}-${bloco()}`;
}
