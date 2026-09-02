-- Canal de Escuta — empresa unica + configuracao inicial.
-- Ajuste o UUID abaixo para bater com VITE_EMPRESA_ID do seu .env.

insert into public.empresas (id, nome, dominio)
values ('00000000-0000-0000-0000-000000000001', 'Empresa', 'escuta.empresa.com.br')
on conflict (id) do nothing;

insert into public.configuracoes_canal (
  empresa_id, nome_canal, dominio, mensagem_boas_vindas, categorias_ativas
) values (
  '00000000-0000-0000-0000-000000000001',
  'Canal de Escuta',
  'escuta.empresa.com.br',
  'Você pode relatar sem se identificar. Não registramos seu nome, seu IP ou o aparelho que você está usando — só o que você quiser contar.',
  '["assedio_moral","assedio_sexual","discriminacao","sobrecarga","conflito_colega","falta_reconhecimento","seguranca_trabalho","sugestao_melhoria"]'::jsonb
) on conflict (empresa_id) do nothing;

-- Para dar acesso ao painel a um membro da equipe:
--   1. crie o usuario em Authentication > Users (e-mail + senha);
--   2. rode, trocando o UUID do usuario:
-- insert into public.equipe_clinica (user_id, empresa_id, nome, papel, crp)
-- values ('<uuid-do-usuario>', '00000000-0000-0000-0000-000000000001',
--         'Márcia Bússolo', 'Psicóloga · Equipe de Escuta', 'CRP 02959');

-- Bucket privado de anexos (Storage): crie um bucket chamado "anexos" com
-- "Public bucket" DESMARCADO. As Edge Functions geram signed URLs de 60s.
