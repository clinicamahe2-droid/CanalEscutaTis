-- Canal de Escuta — Row Level Security
--
-- Regra central de anonimato:
--   * o publico (role anon) NUNCA faz SELECT em casos/mensagens/anexos —
--     a consulta por protocolo passa obrigatoriamente por Edge Function
--     (service_role), que devolve so a visao publica do caso;
--   * INSERT publico e permitido apenas em mensagens_caso e anexos, e ainda
--     assim o app usa Edge Function para criar o caso (gera protocolo no servidor);
--   * a equipe clinica autenticada le/escreve tudo da SUA empresa (eh_equipe()).

alter table public.empresas               enable row level security;
alter table public.configuracoes_canal    enable row level security;
alter table public.equipe_clinica         enable row level security;
alter table public.casos                  enable row level security;
alter table public.mensagens_caso         enable row level security;
alter table public.anexos                 enable row level security;
alter table public.historico_status       enable row level security;
alter table public.notas_internas         enable row level security;
alter table public.pesquisa_encerramento  enable row level security;
alter table public.fila_notificacoes      enable row level security;

-- ---------------------------------------------------------------------
-- empresas / configuracoes: equipe le a sua; config publica vai por Edge Function
-- ---------------------------------------------------------------------
create policy empresas_equipe_select on public.empresas
  for select to authenticated using (public.eh_equipe(id));

create policy config_equipe_all on public.configuracoes_canal
  for all to authenticated
  using (public.eh_equipe(empresa_id))
  with check (public.eh_equipe(empresa_id));

-- ---------------------------------------------------------------------
-- equipe_clinica: cada um enxerga o proprio vinculo
-- ---------------------------------------------------------------------
create policy equipe_self_select on public.equipe_clinica
  for select to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- casos: SEM acesso anon. Equipe: tudo da sua empresa.
-- (a criacao publica acontece via Edge Function com service_role)
-- ---------------------------------------------------------------------
create policy casos_equipe_select on public.casos
  for select to authenticated using (public.eh_equipe(empresa_id));
create policy casos_equipe_update on public.casos
  for update to authenticated
  using (public.eh_equipe(empresa_id))
  with check (public.eh_equipe(empresa_id));

-- ---------------------------------------------------------------------
-- mensagens_caso: INSERT publico permitido; SELECT so equipe.
-- ---------------------------------------------------------------------
create policy mensagens_anon_insert on public.mensagens_caso
  for insert to anon with check (remetente = 'anonimo');
create policy mensagens_equipe_insert on public.mensagens_caso
  for insert to authenticated with check (public.eh_equipe(empresa_id));
create policy mensagens_equipe_select on public.mensagens_caso
  for select to authenticated using (public.eh_equipe(empresa_id));

-- ---------------------------------------------------------------------
-- anexos: INSERT publico permitido; SELECT so equipe.
-- ---------------------------------------------------------------------
create policy anexos_anon_insert on public.anexos
  for insert to anon with check (true);
create policy anexos_equipe_select on public.anexos
  for select to authenticated using (public.eh_equipe(empresa_id));

-- ---------------------------------------------------------------------
-- pesquisa_encerramento: INSERT publico permitido; SELECT so equipe.
-- ---------------------------------------------------------------------
create policy pesquisa_anon_insert on public.pesquisa_encerramento
  for insert to anon with check (true);
create policy pesquisa_equipe_select on public.pesquisa_encerramento
  for select to authenticated using (public.eh_equipe(empresa_id));

-- ---------------------------------------------------------------------
-- historico_status / notas_internas / fila_notificacoes: apenas equipe.
-- ---------------------------------------------------------------------
create policy historico_equipe_all on public.historico_status
  for all to authenticated
  using (public.eh_equipe(empresa_id))
  with check (public.eh_equipe(empresa_id));

create policy notas_equipe_all on public.notas_internas
  for all to authenticated
  using (public.eh_equipe(empresa_id))
  with check (public.eh_equipe(empresa_id));

create policy fila_equipe_select on public.fila_notificacoes
  for select to authenticated using (public.eh_equipe(empresa_id));

-- Nenhuma policy de SELECT/UPDATE/DELETE para anon em nenhuma tabela.
-- Nenhuma policy cruza empresa_id — o filtro por empresa e sempre explicito.
