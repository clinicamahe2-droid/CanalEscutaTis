# Backend Supabase — ordem de aplicação (manual, pelo dono)

Nada aqui roda pela CLI. Aplicar pelo **Dashboard do Supabase**.

## 1. Banco (SQL Editor)

Rode, na ordem:

1. `migrations/0001_schema.sql` — tabelas, índices, triggers, `eh_equipe()`.
2. `migrations/0002_rls.sql` — Row Level Security e policies.
3. `migrations/0003_seed_exemplo.sql` — 1 empresa + configuração inicial. **Troque o UUID** para bater com `VITE_EMPRESA_ID`.
4. `migrations/0004_atendimento_psicologico.sql` — tabela de pedidos de Atendimento Psicológico.
5. `migrations/0005_atendimento_canal_resposta.sql` — código `AP-` de acompanhamento, contato opcional e mensagens da equipe/pessoa.

## 2. Storage

- Crie um bucket **`anexos`** com *Public bucket* **desmarcado**.

## 3. Equipe de escuta

- `Authentication > Users`: crie o usuário (e-mail + senha).
- No SQL Editor, insira o vínculo em `equipe_clinica` (exemplo comentado no fim do `0003`).

## 4. Edge Functions

Publique as 8 funções de `functions/` (`criar-caso`, `consultar-caso`, `responder-caso`, `responder-pesquisa`, `enviar-alerta` e, do Atendimento Psicológico, `criar-atendimento`, `consultar-atendimento`, `responder-atendimento`). As três últimas dependem da migration `0005`.

Secrets necessários:

| Secret | Para quê |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | já existem no projeto |
| `ALERTA_EMAIL_DESTINO` | e-mail que recebe os avisos |
| `RESEND_API_KEY`, `ALERTA_EMAIL_FROM` | envio de e-mail transacional (aba Alertas) |
| `ALERTA_WHATSAPP_DESTINO` | reservado — WhatsApp crítico ainda não implementado (Fase 0) |

## 5. Frontend

No `.env`:

```
VITE_DATA_PROVIDER=supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_EMPRESA_ID=<mesmo UUID do 0003>
```

## Autenticação (recuperação de senha etc.)

Em `Authentication > URL Configuration`, adicione a URL de produção do painel em *Redirect URLs*.
