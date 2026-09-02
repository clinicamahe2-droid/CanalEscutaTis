/**
 * Wrapper defensivo sobre localStorage.
 *  - chaves versionadas (`ce.v1.*`): se o formato local mudar, `ce.v2.*` comeca limpo;
 *  - todo acesso em try/catch: navegacao anonima e "bloquear dados de sites" lancam;
 *  - nunca guarda binario aqui (anexos vao para IndexedDB — ver anexosDb.ts).
 */

export const VERSAO_LOCAL = "v1";
const PREFIXO = `ce.${VERSAO_LOCAL}.`;

function disponivel(): boolean {
  try {
    const k = PREFIXO + "__t";
    localStorage.setItem(k, "1");
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

export const localDisponivel = disponivel();

// Fallback em memoria quando o navegador bloqueia storage — o app nao quebra,
// so nao persiste entre reloads.
const memoria = new Map<string, string>();

export function ler<T>(chave: string, padrao: T): T {
  const full = PREFIXO + chave;
  try {
    const raw = localDisponivel ? localStorage.getItem(full) : memoria.get(full) ?? null;
    if (raw == null) return padrao;
    return JSON.parse(raw) as T;
  } catch {
    return padrao;
  }
}

export function gravar<T>(chave: string, valor: T): void {
  const full = PREFIXO + chave;
  try {
    const raw = JSON.stringify(valor);
    if (localDisponivel) localStorage.setItem(full, raw);
    else memoria.set(full, raw);
  } catch {
    // quota estourada ou storage bloqueado: mantem em memoria como ultimo recurso
    try {
      memoria.set(full, JSON.stringify(valor));
    } catch {
      /* desiste silenciosamente */
    }
  }
}

export function remover(chave: string): void {
  const full = PREFIXO + chave;
  try {
    if (localDisponivel) localStorage.removeItem(full);
    memoria.delete(full);
  } catch {
    /* noop */
  }
}

export function limparTudo(): void {
  try {
    if (localDisponivel) {
      const remover: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIXO)) remover.push(k);
      }
      remover.forEach((k) => localStorage.removeItem(k));
    }
    memoria.clear();
  } catch {
    /* noop */
  }
}
