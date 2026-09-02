import type {
  Anexo,
  Caso,
  ConfiguracoesCanal,
  MensagemCaso,
  NotaInterna,
  NotificacaoFila,
  RascunhoRelato,
  ResultadoCriacaoCaso,
  StatusCaso,
  AvaliacaoEncerramento,
  CategoriaId,
  Gravidade,
} from "@/dominio/tipos";
import {
  EMPRESA_ID,
  type CasoDetalheEquipe,
  type CasoPublico,
  type ConfigPublica,
  type DadosPainel,
  type DataProvider,
} from "./DataProvider";
import { getSupabase } from "@/integrations/supabase/client";

/**
 * Implementacao real do DataProvider sobre Supabase.
 *
 * Depende de:
 *   - tabelas/RLS de `supabase/migrations` aplicadas no Dashboard;
 *   - Edge Functions `criar-caso`, `consultar-caso`, `responder-caso`,
 *     `responder-pesquisa` publicadas (o cliente anonimo nunca faz SELECT direto
 *     em `casos`).
 *
 * Enquanto o projeto Supabase nao existe, este arquivo so e carregado se
 * VITE_DATA_PROVIDER=supabase — ou seja, nunca no modo demonstracao.
 */

async function invoke<T>(fn: string, body: unknown): Promise<T> {
  const { data, error } = await getSupabase().functions.invoke(fn, { body });
  if (error) throw error;
  return data as T;
}

export const supabaseProvider: DataProvider = {
  async getConfigPublica(): Promise<ConfigPublica> {
    return invoke<ConfigPublica>("consultar-caso", { acao: "config_publica", empresa_id: EMPRESA_ID });
  },

  async criarCaso(rascunho: RascunhoRelato): Promise<ResultadoCriacaoCaso> {
    // A Edge Function gera o protocolo (crypto no servidor, retry em colisao),
    // insere em `casos` e enfileira a notificacao conforme a regra de alerta.
    return invoke<ResultadoCriacaoCaso>("criar-caso", { empresa_id: EMPRESA_ID, rascunho });
  },

  async consultarCaso(protocolo: string): Promise<CasoPublico | null> {
    const r = await invoke<CasoPublico | { nao_encontrado: true }>("consultar-caso", {
      acao: "status",
      empresa_id: EMPRESA_ID,
      protocolo,
    });
    return r && !("nao_encontrado" in r) ? r : null;
  },

  async enviarMensagemAnonima(protocolo: string, conteudo: string): Promise<void> {
    await invoke("responder-caso", { origem: "anonimo", empresa_id: EMPRESA_ID, protocolo, conteudo });
  },

  async responderPesquisa(
    protocolo: string,
    avaliacao: AvaliacaoEncerramento,
    comentario: string,
  ): Promise<void> {
    await invoke("responder-pesquisa", { empresa_id: EMPRESA_ID, protocolo, avaliacao, comentario });
  },

  async getDadosPainel(): Promise<DadosPainel> {
    const sb = getSupabase();
    const [casos, mensagens, pesquisas] = await Promise.all([
      sb.from("casos").select("*").eq("empresa_id", EMPRESA_ID).order("criado_em", { ascending: false }),
      sb.from("mensagens_caso").select("*").eq("empresa_id", EMPRESA_ID),
      sb.from("pesquisa_encerramento").select("*").eq("empresa_id", EMPRESA_ID),
    ]);
    if (casos.error) throw casos.error;
    if (mensagens.error) throw mensagens.error;
    if (pesquisas.error) throw pesquisas.error;
    return {
      casos: (casos.data ?? []) as Caso[],
      mensagens: (mensagens.data ?? []) as MensagemCaso[],
      pesquisas: (pesquisas.data ?? []) as any[],
    };
  },

  async getCasoDetalhe(casoId: string): Promise<CasoDetalheEquipe> {
    const sb = getSupabase();
    const [caso, mensagens, notas, historico, anexos, pesquisa] = await Promise.all([
      sb.from("casos").select("*").eq("id", casoId).single(),
      sb.from("mensagens_caso").select("*").eq("caso_id", casoId).order("criado_em"),
      sb.from("notas_internas").select("*").eq("caso_id", casoId).order("criado_em"),
      sb.from("historico_status").select("*").eq("caso_id", casoId).order("criado_em"),
      sb.from("anexos").select("*").eq("caso_id", casoId),
      sb.from("pesquisa_encerramento").select("*").eq("caso_id", casoId).maybeSingle(),
    ]);
    if (caso.error) throw caso.error;
    return {
      caso: caso.data as Caso,
      mensagens: (mensagens.data ?? []) as MensagemCaso[],
      notas: (notas.data ?? []) as NotaInterna[],
      historico: (historico.data ?? []) as any[],
      anexos: (anexos.data ?? []) as Anexo[],
      pesquisa: (pesquisa.data ?? null) as any,
    };
  },

  async responderCaso(casoId: string, conteudo: string): Promise<MensagemCaso> {
    return invoke<MensagemCaso>("responder-caso", {
      origem: "equipe",
      empresa_id: EMPRESA_ID,
      caso_id: casoId,
      conteudo,
    });
  },

  async adicionarNota(casoId: string, conteudo: string, autor: string): Promise<NotaInterna> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("notas_internas")
      .insert({ caso_id: casoId, empresa_id: EMPRESA_ID, autor, conteudo })
      .select()
      .single();
    if (error) throw error;
    return data as NotaInterna;
  },

  async reclassificarCaso(
    casoId: string,
    patch: { categoria?: CategoriaId; gravidade?: Gravidade },
    _responsavel: string,
  ): Promise<Caso> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("casos")
      .update({ ...patch, atualizado_em: new Date().toISOString() })
      .eq("id", casoId)
      .select()
      .single();
    if (error) throw error;
    return data as Caso;
  },

  async mudarStatus(casoId: string, novo: StatusCaso, responsavel: string): Promise<Caso> {
    return invoke<Caso>("responder-caso", {
      origem: "equipe",
      acao: "status",
      empresa_id: EMPRESA_ID,
      caso_id: casoId,
      status: novo,
      responsavel,
    });
  },

  async encaminharCaso(casoId: string, responsavel: string): Promise<Caso> {
    return supabaseProvider.mudarStatus(casoId, "encaminhado", responsavel);
  },

  async encerrarCaso(casoId: string, responsavel: string): Promise<Caso> {
    return supabaseProvider.mudarStatus(casoId, "concluido", responsavel);
  },

  async listarNotificacoes(): Promise<NotificacaoFila[]> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("fila_notificacoes")
      .select("*")
      .eq("empresa_id", EMPRESA_ID)
      .order("criado_em", { ascending: false });
    if (error) throw error;
    return (data ?? []) as NotificacaoFila[];
  },

  async getConfiguracoes(): Promise<ConfiguracoesCanal> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("configuracoes_canal")
      .select("*")
      .eq("empresa_id", EMPRESA_ID)
      .single();
    if (error) throw error;
    return data as ConfiguracoesCanal;
  },

  async salvarConfiguracoes(patch: Partial<ConfiguracoesCanal>): Promise<ConfiguracoesCanal> {
    const sb = getSupabase();
    const { data, error } = await sb
      .from("configuracoes_canal")
      .update({ ...patch, atualizado_em: new Date().toISOString() })
      .eq("empresa_id", EMPRESA_ID)
      .select()
      .single();
    if (error) throw error;
    return data as ConfiguracoesCanal;
  },

  async getAnexoUrl(anexo: Anexo): Promise<string | null> {
    const sb = getSupabase();
    const { data, error } = await sb.storage
      .from("anexos")
      .createSignedUrl(anexo.storage_path, 60);
    if (error) return null;
    return data?.signedUrl ?? null;
  },
};
