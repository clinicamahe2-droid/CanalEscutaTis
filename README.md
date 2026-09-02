# Canal de Escuta

PWA anônimo de canal de escuta e denúncias corporativas. Colaboradores relatam
sem se identificar; uma equipe de psicologia trata os casos num painel.

**Anonimato é o requisito nº 1:** sem login para quem relata, sem coleta de IP /
user-agent / geolocalização, sem analytics de terceiros, sem rede externa (fontes
são self-hosted via `@fontsource`), protocolo nunca vai para a URL.

## Rodar

```bash
npm install
npm run dev        # http://localhost:8080
```

Abre direto, sem backend. O app roda em **modo demonstração**: os dados ficam em
`localStorage` (e os anexos em IndexedDB) só neste navegador. Um banner fixo avisa.

Acesso ao painel (demo): **marcia@escuta.demo** / **escuta2026** (também impresso na
tela de login).

## Gate

```bash
npm run typecheck   # tsc -b --noEmit
npm run lint        # eslint (0 erros; 6 warnings de fast-refresh, idem ao repo de referência)
npm test            # vitest — 20 testes
npm run build       # tsc + vite build + PWA
npm run preview     # serve o build em http://localhost:4173 (única forma de testar o service worker)
```

## Arquitetura

```
src/
  dominio/       regras puras e testáveis (protocolo, SLA, agregações, categorias)
  data/          DataProvider — uma interface, duas implementações
                   localProvider   (padrão)  localStorage + IndexedDB + seed de exemplo
                   supabaseProvider          backend real, atrás de VITE_DATA_PROVIDER=supabase
  contexts/      AuthContext (mesma forma nos dois modos)
  fluxo/         estado do wizard de relato
  hooks/         React Query (queryKeys central, staleTime 30s, sem refetch no foco)
  pages/
    colaborador/ home, apoio imediato, categoria→urgência→relato→revisão→protocolo, consulta
    equipe/      login, painel (Visão Geral, Caixa de Casos, Relatórios, Alertas, Configurações)
supabase/
  migrations/    schema + RLS + seed (aplicar à mão no Dashboard — ver supabase/README.md)
  functions/     Edge Functions (protocolo no servidor, consulta, mensageria, alerta)
```

### Trocar para o backend real

O `dataProvider` tem interface 100% assíncrona e nomes iguais aos do schema SQL.
Para virar a chave: aplicar os SQL de `supabase/` no Dashboard, publicar as Edge
Functions, e no `.env` setar `VITE_DATA_PROVIDER=supabase` + as chaves. Nenhum
call site muda. A suíte `src/test/providerContrato.test.ts` roda contra os dois.

### Deploy

SPA — precisa de rewrite `/* → /index.html` (já em `vercel.json` e `public/_redirects`).

## O que ficou de fora de propósito

- **Sumarização por IA** dos relatos (Fase 3): ponto de extensão deixado na interface, sem botão.
- **WhatsApp real** do alerta crítico (Fase 0/2): estruturado e comentado em `enviar-alerta`, não implementado — depende de decisão de canal.
- Itens não-técnicos da Fase 0 (DPA, política, advogado) não bloqueiam testar, mas bloqueiam pôr na frente de funcionários reais.
