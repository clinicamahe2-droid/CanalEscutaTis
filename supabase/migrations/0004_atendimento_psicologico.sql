-- Canal de Escuta — Atendimento Psicológico
-- Aplicar no SQL Editor do Dashboard do Supabase, depois de 0001-0003.
-- Nada aqui roda automaticamente pelo app.
--
-- Tabela DELIBERADAMENTE separada de `casos` (ver DECISOES.md, 2026-09-08).
-- Aqui a pessoa se identifica (quer ser procurada); em `casos` ela nunca se
-- identifica. Mantendo as duas tabelas fisicamente separadas, o invariante
-- de anonimato vira estrutural — "casos não tem coluna nome" — em vez de
-- depender de uma condição em código que alguém pode quebrar sem perceber.

create table if not exists public.solicitacoes_atendimento (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references public.empresas(id) on delete cascade,
  nome           text not null,
  setor          text not null,
  necessidade    text not null,
  status         text not null default 'nova'
                 check (status in ('nova','em_contato','concluida')),
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  atendido_em    timestamptz
);

create index if not exists solicitacoes_empresa_criado_idx
  on public.solicitacoes_atendimento (empresa_id, criado_em desc);

drop trigger if exists solicitacoes_touch on public.solicitacoes_atendimento;
create trigger solicitacoes_touch before update on public.solicitacoes_atendimento
for each row execute function public.tocar_atualizado_em();

alter table public.solicitacoes_atendimento enable row level security;

-- anon pode criar (é o formulário público), nunca ler/alterar depois — sem
-- protocolo, sem tela de consulta, então não há motivo pra SELECT público.
create policy solicitacoes_anon_insert on public.solicitacoes_atendimento
  for insert to anon with check (true);

-- equipe lê/atualiza (status) só da própria empresa.
create policy solicitacoes_equipe_select on public.solicitacoes_atendimento
  for select to authenticated using (public.eh_equipe(empresa_id));
create policy solicitacoes_equipe_update on public.solicitacoes_atendimento
  for update to authenticated
  using (public.eh_equipe(empresa_id))
  with check (public.eh_equipe(empresa_id));

-- Nenhuma policy de DELETE — mesmo padrão de `casos` (encerra, não apaga).
