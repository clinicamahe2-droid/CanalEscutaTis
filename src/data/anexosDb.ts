/**
 * Armazenamento de anexos (imagens ja sanitizadas) em IndexedDB.
 *
 * Por que nao localStorage: uma foto em dataURL estoura a quota de ~5 MB e
 * derruba TODO o resto do app com QuotaExceededError. IndexedDB guarda Blob
 * nativo, e assincrono, e tem folga de espaco.
 */

const DB_NOME = "ce.v1.anexos";
const STORE = "blobs";

let dbPromise: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB indisponivel"));
      return;
    }
    const req = indexedDB.open(DB_NOME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Falha ao abrir IndexedDB"));
  });
  return dbPromise;
}

function tx<T>(modo: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return abrir().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, modo);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result as T);
        req.onerror = () => reject(req.error);
      }),
  );
}

export function gerarRefAnexo(): string {
  return "anx_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function salvarAnexoBlob(ref: string, blob: Blob): Promise<void> {
  try {
    await tx("readwrite", (s) => s.put(blob, ref));
  } catch {
    /* sem IndexedDB: o anexo simplesmente nao fica disponivel para preview */
  }
}

export async function lerAnexoBlob(ref: string): Promise<Blob | null> {
  try {
    const b = await tx<Blob | undefined>("readonly", (s) => s.get(ref));
    return b ?? null;
  } catch {
    return null;
  }
}

export async function removerAnexoBlob(ref: string): Promise<void> {
  try {
    await tx("readwrite", (s) => s.delete(ref));
  } catch {
    /* noop */
  }
}
