/**
 * Protocolo do caso.
 *
 * O protocolo e a UNICA credencial de acesso ao caso: quem tem o codigo le o
 * relato e conversa com a equipe. Por isso:
 *   - alfabeto Crockford base32 sem caracteres ambiguos (0/O, 1/I/L);
 *   - dois blocos de 4 -> ~41 bits de entropia, inviavel de adivinhar por forca bruta;
 *   - gerado com crypto.getRandomValues, NUNCA Math.random;
 *   - nao e hasheado no banco: a equipe precisa le-lo, e ele nao mapeia para
 *     pessoa nenhuma. O sigilo vem da entropia + RLS (anon sem SELECT).
 *
 * No modo local esta funcao roda no cliente. No modo supabase, quem gera e a
 * Edge Function `criar-caso` (mesma logica), com retry em colisao.
 */

const ALFABETO = "23456789ABCDEFGHJKMNPQRSTVWXYZ"; // 30 simbolos, sem 0 1 I L O U
const BLOCOS = 2;
const TAM_BLOCO = 4;

export const PROTOCOLO_REGEX = /^CE-(\d{4})-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/;

function bytesAleatorios(n: number): Uint8Array {
  const buf = new Uint8Array(n);
  const c = (globalThis as any).crypto;
  if (!c || typeof c.getRandomValues !== "function") {
    throw new Error("crypto.getRandomValues indisponivel neste ambiente");
  }
  c.getRandomValues(buf);
  return buf;
}

function blocoAleatorio(): string {
  // Rejeicao de modulo: so aceita bytes < 240 (8 * 30) para nao enviesar o alfabeto.
  const limite = 256 - (256 % ALFABETO.length);
  let out = "";
  while (out.length < TAM_BLOCO) {
    for (const b of bytesAleatorios(TAM_BLOCO * 2)) {
      if (b >= limite) continue;
      out += ALFABETO[b % ALFABETO.length];
      if (out.length === TAM_BLOCO) break;
    }
  }
  return out;
}

export function gerarProtocolo(ano: number = new Date().getUTCFullYear()): string {
  const blocos = Array.from({ length: BLOCOS }, () => blocoAleatorio());
  return `CE-${ano}-${blocos.join("-")}`;
}

/**
 * Codigo de acompanhamento do Atendimento Psicologico: `AP-AAAA-XXXX-XXXX-XXXX`.
 * Tres blocos (~59 bits), nao dois: aqui quem acerta o codigo ve uma conversa
 * de pessoa IDENTIFICADA, entao o custo de um acerto e maior que no relato
 * anonimo. Prefixo proprio para nunca ser confundido com um protocolo `CE-`.
 */
const BLOCOS_ATENDIMENTO = 3;
const ALFABETO_CLASSE = "[23456789ABCDEFGHJKMNPQRSTVWXYZ]";

export const CODIGO_ATENDIMENTO_REGEX = new RegExp(
  `^AP-(\\d{4})-${ALFABETO_CLASSE}{4}-${ALFABETO_CLASSE}{4}-${ALFABETO_CLASSE}{4}$`,
);

export function gerarCodigoAtendimento(ano: number = new Date().getUTCFullYear()): string {
  const blocos = Array.from({ length: BLOCOS_ATENDIMENTO }, () => blocoAleatorio());
  return `AP-${ano}-${blocos.join("-")}`;
}

/** Igual a `normalizarProtocolo`, para o codigo `AP-AAAA-XXXX-XXXX-XXXX`. */
export function normalizarCodigoAtendimento(bruto: string): string {
  const limpo = (bruto || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  const m = /^AP(\d{4})([0-9A-Z]{12})$/.exec(limpo);
  if (!m) return (bruto || "").trim().toUpperCase();
  const c = m[2];
  return `AP-${m[1]}-${c.slice(0, 4)}-${c.slice(4, 8)}-${c.slice(8, 12)}`;
}

export function codigoAtendimentoValido(valor: string): boolean {
  return CODIGO_ATENDIMENTO_REGEX.test(normalizarCodigoAtendimento(valor));
}

/** Decide, pelo prefixo, se o texto digitado e um codigo de atendimento (`AP`) ou de relato. */
export function ehCodigoAtendimento(bruto: string): boolean {
  return /^AP/.test((bruto || "").toUpperCase().replace(/[^0-9A-Z]/g, ""));
}

/**
 * Aceita o codigo com espacos, minusculas ou sem hifens e devolve na forma
 * canonica `CE-AAAA-XXXX-XXXX`. Nao "adivinha" caracteres: se o que sobrar nao
 * casar com o formato, devolve o texto como veio (a consulta responde com o
 * generico "protocolo nao encontrado").
 */
export function normalizarProtocolo(bruto: string): string {
  const limpo = (bruto || "").toUpperCase().replace(/[^0-9A-Z]/g, "");
  const m = /^CE(\d{4})([0-9A-Z]{8})$/.exec(limpo);
  if (!m) return (bruto || "").trim().toUpperCase();
  const corpo = m[2];
  return `CE-${m[1]}-${corpo.slice(0, 4)}-${corpo.slice(4, 8)}`;
}

export function protocoloValido(valor: string): boolean {
  return PROTOCOLO_REGEX.test(normalizarProtocolo(valor));
}
