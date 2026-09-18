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

// Mesma logica de src/dominio/protocolo.ts (gerarCodigoAtendimento) — 3 blocos, prefixo AP.
export function gerarCodigoAtendimento(ano = new Date().getUTCFullYear()): string {
  return `AP-${ano}-${bloco()}-${bloco()}-${bloco()}`;
}

// Aceita o codigo digitado com espacos/minusculas/sem hifens e devolve o formato canonico.
export function normalizarCodigoAtendimento(bruto: string): string {
  const limpo = String(bruto ?? "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  const m = /^AP(\d{4})([0-9A-Z]{12})$/.exec(limpo);
  if (!m) return String(bruto ?? "").trim().toUpperCase();
  const c = m[2];
  return `AP-${m[1]}-${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8, 12)}`;
}
