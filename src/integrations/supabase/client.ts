import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase — criado sob demanda. Enquanto VITE_DATA_PROVIDER=local, este
 * modulo nunca e importado (o seletor em data/index.ts faz import dinamico), entao
 * a ausencia das envs abaixo nao derruba o boot.
 */
let cliente: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cliente) return cliente;
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. Configure o .env para usar o modo supabase.",
    );
  }
  cliente = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
  return cliente;
}
