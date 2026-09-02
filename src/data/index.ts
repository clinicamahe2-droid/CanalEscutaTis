import { MODO_DADOS, type DataProvider } from "./DataProvider";
import { localProvider } from "./localProvider";

export { MODO_DADOS, EMPRESA_ID } from "./DataProvider";
export type {
  DataProvider,
  CasoPublico,
  CasoDetalheEquipe,
  ConfigPublica,
  DadosPainel,
} from "./DataProvider";

let cache: DataProvider | null = null;

/**
 * Devolve o provider ativo. No modo local e sincrono na pratica (resolve na hora).
 * No modo supabase, o modulo real so e baixado quando pedido — assim a ausencia
 * das envs do Supabase nunca atrapalha o boot em modo demonstracao.
 */
export async function getProvider(): Promise<DataProvider> {
  if (cache) return cache;
  if (MODO_DADOS === "supabase") {
    const mod = await import("./supabaseProvider");
    cache = mod.supabaseProvider;
  } else {
    cache = localProvider;
  }
  return cache;
}
