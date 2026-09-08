import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getProvider } from "@/data";
import { qk } from "./queryKeys";
import { useAuth } from "@/contexts/AuthContext";
import type {
  AvaliacaoEncerramento,
  CategoriaId,
  ConfiguracoesCanal,
  Gravidade,
  RascunhoAtendimento,
  RascunhoRelato,
  StatusCaso,
  StatusSolicitacao,
} from "@/dominio/tipos";

// ---------------- queries ----------------

export function useConfigPublica() {
  return useQuery({
    queryKey: qk.configPublica,
    queryFn: async () => (await getProvider()).getConfigPublica(),
    staleTime: 5 * 60_000,
  });
}

export function useDadosPainel() {
  return useQuery({
    queryKey: qk.painel,
    queryFn: async () => (await getProvider()).getDadosPainel(),
  });
}

export function useCasoDetalhe(casoId: string | undefined) {
  return useQuery({
    queryKey: qk.caso(casoId ?? "—"),
    queryFn: async () => (await getProvider()).getCasoDetalhe(casoId as string),
    enabled: !!casoId,
  });
}

export function useConsultaCaso(protocolo: string, enabled: boolean) {
  return useQuery({
    queryKey: qk.consulta(protocolo),
    queryFn: async () => (await getProvider()).consultarCaso(protocolo),
    enabled: enabled && !!protocolo,
    retry: false,
    staleTime: 0,
  });
}

export function useNotificacoes() {
  return useQuery({
    queryKey: qk.notificacoes,
    queryFn: async () => (await getProvider()).listarNotificacoes(),
  });
}

export function useConfiguracoes() {
  return useQuery({
    queryKey: qk.configuracoes,
    queryFn: async () => (await getProvider()).getConfiguracoes(),
  });
}

export function useSolicitacoes() {
  return useQuery({
    queryKey: qk.solicitacoes,
    queryFn: async () => (await getProvider()).listarSolicitacoesAtendimento(),
  });
}

// ---------------- mutations (colaborador) ----------------

export function useCriarCaso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rascunho: RascunhoRelato) => (await getProvider()).criarCaso(rascunho),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.painel });
      qc.invalidateQueries({ queryKey: qk.notificacoes });
    },
  });
}

export function useEnviarMensagemAnonima(protocolo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conteudo: string) =>
      (await getProvider()).enviarMensagemAnonima(protocolo, conteudo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.consulta(protocolo) });
      qc.invalidateQueries({ queryKey: qk.painel });
    },
  });
}

export function useCriarSolicitacaoAtendimento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rascunho: RascunhoAtendimento) =>
      (await getProvider()).criarSolicitacaoAtendimento(rascunho),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.solicitacoes }),
  });
}

export function useResponderPesquisa(protocolo: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { avaliacao: AvaliacaoEncerramento; comentario: string }) =>
      (await getProvider()).responderPesquisa(protocolo, v.avaliacao, v.comentario),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.consulta(protocolo) });
      qc.invalidateQueries({ queryKey: qk.painel });
    },
  });
}

// ---------------- mutations (equipe) ----------------

function useResponsavel() {
  const { sessao } = useAuth();
  return sessao?.nome ?? "Equipe";
}

export function useResponderCaso(casoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (conteudo: string) => (await getProvider()).responderCaso(casoId, conteudo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.caso(casoId) });
      qc.invalidateQueries({ queryKey: qk.painel });
    },
  });
}

export function useAdicionarNota(casoId: string) {
  const qc = useQueryClient();
  const autor = useResponsavel();
  return useMutation({
    mutationFn: async (conteudo: string) => (await getProvider()).adicionarNota(casoId, conteudo, autor),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.caso(casoId) }),
  });
}

export function useReclassificar(casoId: string) {
  const qc = useQueryClient();
  const resp = useResponsavel();
  return useMutation({
    mutationFn: async (patch: { categoria?: CategoriaId; gravidade?: Gravidade }) =>
      (await getProvider()).reclassificarCaso(casoId, patch, resp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.caso(casoId) });
      qc.invalidateQueries({ queryKey: qk.painel });
    },
  });
}

export function useMudarStatus(casoId: string) {
  const qc = useQueryClient();
  const resp = useResponsavel();
  return useMutation({
    mutationFn: async (novo: StatusCaso) => (await getProvider()).mudarStatus(casoId, novo, resp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.caso(casoId) });
      qc.invalidateQueries({ queryKey: qk.painel });
    },
  });
}

export function useEncaminhar(casoId: string) {
  const qc = useQueryClient();
  const resp = useResponsavel();
  return useMutation({
    mutationFn: async () => (await getProvider()).encaminharCaso(casoId, resp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.caso(casoId) });
      qc.invalidateQueries({ queryKey: qk.painel });
    },
  });
}

export function useEncerrar(casoId: string) {
  const qc = useQueryClient();
  const resp = useResponsavel();
  return useMutation({
    mutationFn: async () => (await getProvider()).encerrarCaso(casoId, resp),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.caso(casoId) });
      qc.invalidateQueries({ queryKey: qk.painel });
    },
  });
}

export function useMudarStatusSolicitacao() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { id: string; status: StatusSolicitacao }) =>
      (await getProvider()).mudarStatusSolicitacao(v.id, v.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.solicitacoes }),
  });
}

export function useSalvarConfiguracoes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<ConfiguracoesCanal>) =>
      (await getProvider()).salvarConfiguracoes(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.configuracoes });
      qc.invalidateQueries({ queryKey: qk.configPublica });
    },
  });
}

export function useResetarDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const p = await getProvider();
      await p.resetarDemo?.();
    },
    onSuccess: () => qc.invalidateQueries(),
  });
}
