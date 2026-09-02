/** Fabrica central de chaves do React Query — evita string solta espalhada. */
export const qk = {
  configPublica: ["config-publica"] as const,
  painel: ["painel"] as const,
  caso: (id: string) => ["caso", id] as const,
  consulta: (protocolo: string) => ["consulta", protocolo] as const,
  notificacoes: ["notificacoes"] as const,
  configuracoes: ["configuracoes"] as const,
};
