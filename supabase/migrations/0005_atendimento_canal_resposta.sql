-- Canal de Escuta — Atendimento Psicológico: canal de resposta
-- Aplicar no SQL Editor do Dashboard do Supabase, depois de 0001-0004.
-- Nada aqui roda automaticamente pelo app.
--
-- Reverte, de propósito, o "sem protocolo" da 0004 (ver DECISOES.md,
-- 2026-09-18): a equipe agora responde à pessoa por aqui, e ela consulta com
-- um código PRÓPRIO `AP-AAAA-XXXX-XXXX-XXXX` — nunca um protocolo `CE-`. As
-- mensagens vivem em tabela nova, separada de `mensagens_caso`, para que
-- conversa de pessoa identificada nunca entre no corpus/indicadores anônimos.

alter table public.solicitacoes_atendimento
  add column if not exists codigo text;

-- `codigo` fica nullable só porque linhas antigas (anteriores a esta migration)
-- não têm código; toda linha nova é criada pela Edge Function `criar-atendimento`,
-- que sempre preenche. UNIQUE parcial ignora os nulos.
create unique index if not exists solicitacoes_codigo_uniq
  on public.solicitacoes_atendimento (codigo) where codigo is not null;

create table if not exists public.mensagens_atendimento (
  id              uuid primary key default gen_random_uuid(),
  solicitacao_id  uuid not null references public.solicitacoes_atendimento(id) on delete cascade,
  empresa_id      uuid not null references public.empresas(id) on delete cascade,
  remetente       text not null check (remetente in ('equipe','pessoa')),
  conteudo        text not null,
  criado_em       timestamptz not null default now()
);

create index if not exists mensagens_atendimento_sol_idx
  on public.mensagens_atendimento (solicitacao_id, criado_em);

alter table public.mensagens_atendimento enable row level security;

-- anon: NENHUMA policy (nem em mensagens_atendimento nem, daqui pra frente, em
-- solicitacoes_atendimento). Criar pedido, consultar e responder passam pelas
-- Edge Functions com service role. Isso é mais fechado que `casos` hoje.
drop policy if exists solicitacoes_anon_insert on public.solicitacoes_atendimento;

-- equipe só lê (a resposta da equipe entra pela Edge Function `responder-atendimento`).
create policy mensagens_atendimento_equipe_select on public.mensagens_atendimento
  for select to authenticated using (public.eh_equipe(empresa_id));

-- Nenhuma policy de UPDATE/DELETE — mensagem enviada não se edita nem se apaga.
