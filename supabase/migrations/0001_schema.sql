-- Canal de Escuta — schema base
-- Aplicar no SQL Editor do Dashboard do Supabase, na ordem dos arquivos.
-- Nada aqui roda automaticamente pelo app.

create extension if not exists "pgcrypto";

-- =====================================================================
-- Tabelas
-- =====================================================================

create table if not exists public.empresas (
  id          uuid primary key default gen_random_uuid(),
  nome        text not null,
  dominio     text not null,
  criado_em   timestamptz not null default now()
);

create table if not exists public.configuracoes_canal (
  empresa_id                            uuid primary key references public.empresas(id) on delete cascade,
  nome_canal                            text not null default 'Canal de Escuta',
  dominio                               text not null default '',
  mensagem_boas_vindas                  text not null default '',
  categorias_ativas                     jsonb not null default '[]'::jsonb,
  permitir_anexos                       boolean not null default true,
  permitir_mensagens_pos_encerramento   boolean not null default false,
  pesquisa_encerramento_ativa           boolean not null default true,
  atualizado_em                         timestamptz not null default now()
);

create table if not exists public.equipe_clinica (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  nome        text not null,
  papel       text not null default 'Equipe de Escuta',
  crp         text,
  criado_em   timestamptz not null default now(),
  unique (user_id, empresa_id)
);

create table if not exists public.casos (
  id             uuid primary key default gen_random_uuid(),
  empresa_id     uuid not null references public.empresas(id) on delete cascade,
  protocolo      text not null unique,
  categoria      text not null,
  gravidade      text not null default 'media'  check (gravidade in ('baixa','media','critica')),
  status         text not null default 'recebido'
                 check (status in ('recebido','triagem','em_andamento','encaminhado','concluido')),
  urgencia       text not null default 'baixa'  check (urgencia in ('alta','baixa')),
  canal_origem   text not null default 'pwa'    check (canal_origem in ('pwa','qrcode')),
  setor          text,
  relato         text not null,
  quer_retorno   boolean not null default true,
  encaminhado    boolean not null default false,
  criado_em      timestamptz not null default now(),
  atualizado_em  timestamptz not null default now(),
  sla_prazo      timestamptz not null,
  encerrado_em   timestamptz
);

create table if not exists public.mensagens_caso (
  id          uuid primary key default gen_random_uuid(),
  caso_id     uuid not null references public.casos(id) on delete cascade,
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  remetente   text not null check (remetente in ('equipe','anonimo')),
  conteudo    text not null,
  criado_em   timestamptz not null default now()
);

create table if not exists public.anexos (
  id            uuid primary key default gen_random_uuid(),
  caso_id       uuid not null references public.casos(id) on delete cascade,
  empresa_id    uuid not null references public.empresas(id) on delete cascade,
  storage_path  text not null,
  nome          text not null,
  tipo          text not null,
  tamanho       integer not null default 0,
  criado_em     timestamptz not null default now()
);

create table if not exists public.historico_status (
  id               uuid primary key default gen_random_uuid(),
  caso_id          uuid not null references public.casos(id) on delete cascade,
  empresa_id       uuid not null references public.empresas(id) on delete cascade,
  status_anterior  text,
  status_novo      text not null,
  responsavel      text not null,
  criado_em        timestamptz not null default now()
);

create table if not exists public.notas_internas (
  id          uuid primary key default gen_random_uuid(),
  caso_id     uuid not null references public.casos(id) on delete cascade,
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  autor       text not null,
  conteudo    text not null,
  criado_em   timestamptz not null default now()
);

create table if not exists public.pesquisa_encerramento (
  id          uuid primary key default gen_random_uuid(),
  caso_id     uuid not null references public.casos(id) on delete cascade unique,
  empresa_id  uuid not null references public.empresas(id) on delete cascade,
  avaliacao   text not null check (avaliacao in ('nao_ouvido','em_parte','ouvido')),
  comentario  text,
  criado_em   timestamptz not null default now()
);

create table if not exists public.fila_notificacoes (
  id            uuid primary key default gen_random_uuid(),
  empresa_id    uuid not null references public.empresas(id) on delete cascade,
  caso_id       uuid not null references public.casos(id) on delete cascade,
  protocolo     text not null,
  canal         text not null check (canal in ('email','whatsapp')),
  destinatario  text not null,
  assunto       text not null,
  corpo         text not null,
  regra         text not null check (regra in ('imediato','resumo_diario','resumo_semanal')),
  enviado       boolean not null default false,
  criado_em     timestamptz not null default now()
);

-- =====================================================================
-- Indices
-- =====================================================================

create index if not exists casos_empresa_status_idx  on public.casos (empresa_id, status);
create index if not exists casos_empresa_criado_idx   on public.casos (empresa_id, criado_em desc);
create index if not exists casos_protocolo_idx        on public.casos (protocolo);
create index if not exists mensagens_caso_idx         on public.mensagens_caso (caso_id, criado_em);
create index if not exists anexos_caso_idx            on public.anexos (caso_id);
create index if not exists historico_caso_idx         on public.historico_status (caso_id, criado_em);
create index if not exists notas_caso_idx             on public.notas_internas (caso_id, criado_em);
create index if not exists fila_empresa_idx           on public.fila_notificacoes (empresa_id, criado_em desc);

-- =====================================================================
-- Trigger de atualizado_em
-- =====================================================================

create or replace function public.tocar_atualizado_em()
returns trigger language plpgsql as $$
begin
  new.atualizado_em := now();
  return new;
end;
$$;

drop trigger if exists casos_touch on public.casos;
create trigger casos_touch before update on public.casos
for each row execute function public.tocar_atualizado_em();

-- Helper: o usuario autenticado pertence a equipe clinica desta empresa?
create or replace function public.eh_equipe(p_empresa uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.equipe_clinica ec
    where ec.user_id = auth.uid() and ec.empresa_id = p_empresa
  );
$$;
