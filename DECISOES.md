# Decisões — Canal de Escuta

Registro de decisões de arquitetura/design tomadas fora do código, conforme
pedido no prompt de execução (`PROMPTEXECUCAOCANALESCUTA.txt`). Ordem
cronológica, mais recente no topo.

---

## 2026-09-08 — Descrições de categoria, Atendimento Psicológico, glass no fluxo inteiro

Pedido do dono, lista de itens numa mensagem só. Consultei o gerente Opus
antes de mexer no dado (ver prompt/resposta completos no histórico da sessão)
porque o item novo — Atendimento Psicológico — tensiona direto com o
invariante central do produto (anonimato). Decisões abaixo seguem a
recomendação dele.

**Atendimento Psicológico — entidade separada, não uma 9ª categoria.** Criei
`SolicitacaoAtendimento` (tipo em `tipos.ts`, tabela `solicitacoes_atendimento`
em `supabase/migrations/0004_atendimento_psicologico.sql`, ainda não aplicada
— dono aplica à mão) em vez de adicionar `categoria: "atendimento_psicologico"`
a `Caso` com um campo `nome`. Motivo: `CategoriaId` é consumido por
`categoriaMeta` (gravidade/regra de alerta), `calcularPrazoSla`,
`mapaDeRisco`/`resumoMensal` (relatório PGR) e pelo dropdown de
reclassificar — um pedido identificado não tem gravidade nem SLA nem sentido
nesse relatório, e reclassificar um caso anônimo *para* essa categoria (ou
vice-versa) teria virado um jeito acidental de vazar nome pro corpus
anônimo. Com tabela separada o invariante "casos não tem coluna nome" é
estrutural, não uma condição que alguém pode esquecer de checar depois.

Consequências dessa escolha:
- Estado local só na tela (`AtendimentoPsicologico.tsx`, `useState` próprio)
  — nunca entra no `RelatoContext`/rascunho do relato anônimo.
- **Sem protocolo.** Ao contrário do relato, aqui a pessoa já deu nome e
  setor pra ser procurada — um código de acompanhamento seria um segundo
  caminho, mais fraco, até um registro que contém identidade. Fire-and-forget:
  confirmação na hora ("A equipe vai te procurar"), sem rota `/consulta`.
- **Tela dedicada no painel** (`/painel/atendimentos`, item "Atendimento" na
  sidebar, entre Caixa de Casos e Relatórios, com badge de "novas" igual ao
  badge de atrasados). Não entra na Caixa de Casos — colunas
  Protocolo/Gravidade/SLA não fazem sentido pra um pedido identificado, e
  qualquer filtro/contagem ali teria que ganhar uma exceção pra não misturar.
- `DataProvider` ganhou 3 métodos (`criarSolicitacaoAtendimento`,
  `listarSolicitacoesAtendimento`, `mudarStatusSolicitacao`) implementados
  nos dois providers. No Supabase, INSERT anônimo direto (RLS: `anon` só
  insere, nunca lê) — sem Edge Function, porque não há protocolo pra gerar
  nem notificação condicional pra decidir (diferente de `criar-caso`).
- Teste novo em `providerContrato.test.ts`: prova em runtime (não só em
  compile-time) que nenhum objeto de `getDadosPainel().casos` tem a chave
  `nome`, e que uma solicitação não aparece nessa lista.

**Categoria vira lista de cards com descrição.** Grid 2×N de botões pequenos
virou lista de 1 coluna (`space-y-2.5`, mesma estrutura de card já usada em
`Urgencia.tsx` — reaproveitamento, não um padrão novo). Cada categoria ganhou
`descricao` (uma linha, mesmo registro calmo do resto do texto) em
`categorias.ts`. Depois de um `border-t` com o rótulo mono "Outro caminho",
o card de Atendimento Psicológico usa `stamp`/dourado em vez de
`seal`/jade — é a única cor do sistema que ainda não tinha função de
destaque de conteúdo, então marca visualmente "isso é outro caminho, não
mais uma opção de categoria" sem inventar um token novo. Não participa da
seleção (`setCategoria`) nem do botão "Continuar" — navega direto pra
`/atendimento` no clique, com seta à direita reforçando que é link de saída.

**Glass effect em todo o fluxo, não só a Home.** `Button` (usado em
Categoria/Urgencia/Relato/Revisao/Protocolo/Consulta/Apoio/Atendimento e no
painel) ganhou duas classes novas em `index.css` — `.glass-btn-primary`
(gradiente jade translúcido + blur + sweep de brilho no hover, variante
`default`) e `.glass-btn-glass` (branco translúcido + blur + brilho de
borda, variantes `outline`/`secondary`). É a mesma linguagem visual dos
botões da Home (`mahe-btn-*`), só que com os valores rgba do `seal`/`paper`
deste sistema em vez da paleta cream/dourado — não trouxe a paleta da Home
pro resto do app, só a técnica. `ghost`/`link`/`destructive` ficaram como
estavam (intencionalmente minimalistas, sem glass).

**Travessão (—) removido de todo texto renderizado** (colaborador e painel):
trocado por vírgula, dois-pontos, ponto-final ou "·" (o separador que o app
já usa em rótulos tipo "TIS · Terminal Intermodal Sul"), dependendo do que
soa mais natural na frase — nunca um caractere por outro sem reler a frase.
Placeholders de "valor ausente" (`Revisao.tsx`, `VisaoGeral.tsx`,
`lib/datas.ts`) viraram hífen simples `-`. Comentários de código (nunca
renderizados) não foram tocados — o pedido era sobre o texto que aparece pra
alguém, não sobre a documentação interna.

**Splash de abertura com a marca da TIS.** `SplashScreen.tsx`, ~1.4s,
mostrada uma vez por carregamento do app (não por navegação entre telas),
overlay que não bloqueia o app por baixo carregando, respeita
`prefers-reduced-motion` (pula direto, sem fade). **Usa o asset atual
`src/assets/tis-logo.jpg` como placeholder** — o dono colou uma logo nova
(fundo diferente, sem o ícone de navio) na conversa, mas uma imagem colada
no chat não vira arquivo acessível no disco pra mim (mesma limitação já
registrada pro logo da Clínica Mahê, resolvida na sessão seguinte quando o
dono me deu o caminho do arquivo de verdade). **Pendente:** dono precisa
salvar o arquivo em algum lugar e passar o caminho pra eu trocar o asset —
aí a splash e o `LogoTIS.tsx` (usado no rodapé do Login e na sidebar do
painel) atualizam sozinhos, é um `src/assets/tis-logo.jpg` só.

Gate verde (`typecheck`/`lint`/`vitest` 22 testes, 2 novos/`build`).
Verificado no navegador: fluxo completo Categoria → Atendimento Psicológico →
confirmação (sem protocolo) → painel → `/painel/atendimentos` mostrando o
pedido, mudança de status funcionando, badge da sidebar atualizando.

---

## 2026-09-03 — Repele: pele "Matcha" sobre o sistema "documento, não spa"

Pedido direto do dono no chat (sem prompt formal), com duas referências
externas (arquivos do dono, fora do repo, não versionadas):
- `Matcha.html` — landing page de marketing para chá matcha cerimonial
  ("ASAGIRI"): paleta jade/bone/ouro, serifada + grotesk, GSAP/ScrollTrigger,
  scroll pinado horizontal, parallax, loader. **"Matcha é a proposta."**
- `design-system.html` (glass-effect2, "Liquid Glass") — tema escuro com
  painéis de vidro/blur. **Pedido explícito: só os botões, os efeitos** — não
  a paleta escura nem o blur.

**Decisão: troca de paleta/tipografia, mantendo a estrutura e disciplina do
sistema anterior — não é um redesign de layout, é reskin de tokens.** Os
nomes de token (`ink`, `paper`, `seal`, `signal`, `stamp`, `record`) e a regra
"cada cor uma função" continuam; só os valores mudam. Não trago o aparato de
landing page do Matcha (GSAP, Lenis, scroll pinado, parallax, loader, cursor
customizado) — o app é um fluxo de formulário curto de 8 telas, não uma
página de marketing; usar scrollytelling ali seria a mesma incoerência que o
prompt anterior evitou ao rejeitar "spa".

**Mapeamento de cor (mesmo papel, valor novo):**

| Token | Antes (verde-floresta) | Agora (Matcha) |
|---|---|---|
| `ink` / `ink-2` | `#23271b`-ish | `#23271f` / `#41463a` (ink do Matcha) |
| `record` | cinza esverdeado | `#a9997d` (stone-d do Matcha) |
| `paper` / `paper-2` | creme | `#f4f0e6` / `#ece6d7` (bone/bone-2) |
| `paper-raised` | branco puro | `#fbf9f2` (card do Matcha, mais quente que branco) |
| `seal` | `#234b3e` | `#3a4a31` (jade-d do Matcha) |
| `stamp` | `#a6842e` | `#b89b5e` (gold do Matcha) |
| `signal` | `#9c4a32` | **inalterado** — o Matcha não tem cor de alarme; o
  terracota antigo já combina com jade/bone/ouro, não inventei uma nova. |

Todos os valores derivados (tints, `border`, `input`, `accent`,
`primary-soft`) foram recalculados a partir desses hex — não são chute, são
composição matemática da cor translúcida sobre o fundo correspondente (mesma
técnica já documentada no bloco anterior).

**Tipografia:** `Source Serif 4` → `Instrument Serif` (display), `IBM Plex
Sans` → `Hanken Grotesk` (body) — as duas fontes web do Matcha. `JetBrains
Mono` continua igual: o Matcha não tem mono, e código de protocolo/timestamp
precisa de um. Self-hosted via `@fontsource` (`^5.3.0` ambos, confirmado no
npm antes de trocar) — mesma arquitetura zero-request-externo do bloco
anterior, não abro exceção para o `<link rel=preconnect>` do Google Fonts que
o `Matcha.html` usa.

**Raio do botão — testado como pílula, revertido.** Primeira versão copiava
o botão do Matcha (`border-radius:100px`). O dono viu renderizado e apontou:
"está muito com cara de IA" — botão-pílula full-width empilhado é o clichê
nº1 de landing page/produto gerado por IA. Corrigido no mesmo dia: `Button`
volta para `rounded` (4px, igual ao resto do app). O raio NÃO é o que
distingue a pele Matcha — é a cor/tipografia; a pílula era só reincidência de
um padrão genérico, não uma decisão calculada, então saiu sem dó.

**Botões — efeito emprestado do glass-effect2 (só isso, nada de blur):**
- `default` (ação primária, fundo `seal` sólido): hover levanta 2px
  (`-translate-y-0.5`) e ganha sombra — o mesmo "lift" que tanto o Matcha
  (`.btn.solid:hover{transform:translateY(-2px)}`) quanto o glass DS usam
  para hover de botão sólido.
- `secondary`/`outline`: hover inverte para preenchimento `seal` sólido com
  texto `paper` — o padrão "invert on hover" que aparece **nos dois** DS de
  referência de forma independente (`.nbtn:hover` no Matcha, "Secondary
  Button" no glass DS), então é uma escolha bem sustentada, não um palpite.
- Não trouxe: cursor customizado, glassmorphism/blur, parallax, shimmer de
  scroll — nada disso se aplica a botões de formulário num app anônimo leve.

**Escopo:** as mesmas 8 telas do fluxo do colaborador (Home + Apoio +
Categoria + Urgência + Relato + Revisão + Protocolo + Consulta), porque os
tokens são globais (`index.css`/`tailwind.config.ts`) — qualquer tela que
consome os tokens semânticos herda a pele nova automaticamente, inclusive o
painel da equipe (mesmo efeito colateral já documentado e aceito no bloco
anterior: raio de botão mais arredondado no painel também, sem tocar seus
componentes).

**Verificado:** as 8 telas do fluxo renderizadas no navegador (`localhost`,
mobile 375px-equivalente), incluindo os 3 estados de cor problemáticos —
seleção "urgente" (`signal`), Selo na Home e no Protocolo (`seal`+`stamp`),
hover-invert do botão "Copiar código" — e o gate completo (`typecheck`,
`lint`, `vitest` 20 testes, `vite build`) verde.

**Fonte `--seal-foreground`:** passou a `var(--paper)` (referência direta em
vez de valor duplicado) — mesmo valor funcional de antes, só menos redundante
de manter.

**Correção pós-print — "cara de IA" (mesmo dia, logo depois do print acima).**
O dono viu as telas renderizadas e resumiu em uma frase: "está muito com cara
de IA". Causas concretas apontadas, não feeling vago:
1. Botão pílula full-width empilhado (ver acima — revertido).
2. Bloco de abertura da Home centralizado (selo + rótulo "Canal
   confidencial" + título + parágrafo, tudo `items-center text-center`) — é
   o template mais repetido de hero de onboarding gerado por IA.
3. Rótulo mono maiúsculo repetido acima de valor óbvio ("CATEGORIA" acima do
   nome da categoria, em `Relato.tsx` e `Revisao.tsx`) — assinatura de
   "design system sintético" tela a tela, não de alguém desenhando cada uma.
4. Tudo centralizado, mesmo respiro em todo canto — zero assimetria.

Aplicado (só isso, sem reabrir o resto do redesign):
- `Home.tsx`: bloco de abertura virou `text-left`, sem `items-center`; selo
  reduzido de 52px pra 38px, sem o rótulo "Canal confidencial" (redundante
  com o próprio `<h1>` duas linhas abaixo).
- `Relato.tsx` e `Revisao.tsx`: a legenda mono "Categoria" saiu; o nome da
  categoria fica sozinho, em `font-semibold`, sem rótulo — o usuário acabou
  de escolher aquele valor numa tela de botões, não precisa de legenda pra
  reconhecer o que é.
- `Consulta.tsx` (rótulo de campo "Código do protocolo") e o rótulo "Seu
  relato"/"Seu protocolo" nas telas de revisão/confirmação **ficaram** — ali
  o rótulo resolve ambiguidade real (o campo está vazio antes do
  preenchimento; o texto livre do relato não se identifica sozinho como tal).

Gate rodado de novo depois da correção: `typecheck`/`lint` limpos (mesmos 6
warnings pré-existentes, 0 erros); as 8 telas reconferidas visualmente.

---

## 2026-09-03 — Home vira hero de 2 colunas (referência canalescutahomev3.html)

Pedido do dono, com arquivo de referência completo (HTML/CSS/JS,
`canalescutahomev3.html`, salvo na raiz do repo — mesmo padrão de
`designsystemescuta.html`). Ao contrário dos dois redesigns anteriores desta
data (pele Matcha), este é **só a Home** — as outras 7 telas do fluxo não
mudam nada.

**Por que não reaproveita `ink/paper/seal/stamp`:** a referência usa outra
paleta (creme `#F6F1E4` + verde escuro `#141D0E–#2C3E20` + dourado `#D89A4C`)
e outra tipografia (Fraunces/Source Sans 3/IBM Plex Mono) — não é uma
variação da pele Matcha, é uma terceira linguagem visual, só para a porta de
entrada. Criei um namespace `mahe.*` isolado em `tailwind.config.ts`
(`font-mahe-display/body/mono`, `bg-mahe-cream`, etc.) em vez de sobrescrever
os tokens do fluxo — Categoria/Urgência/Relato/etc. continuam exatamente como
estavam. Fontes novas self-hosted via `@fontsource` (mesma regra de
zero-request-externo).

**Layout:** grid de 2 colunas (`1.15fr 0.85fr`) acima de 921px (breakpoint
próprio, `mahe-2col` em `tailwind.config.ts` — não bate com nenhum breakpoint
padrão do Tailwind), colapsa pra 1 coluna abaixo disso. Painel esquerdo
(creme) com o conteúdo; painel direito (verde escuro com 2 glow-orbs
animados) com a marca — usa o SVG exato da Clínica Mahê (casa + galho),
extraído da referência pro componente `LogoMahe.tsx` (mesmo padrão do
`Selo.tsx`: vetor único, reutilizável, nunca redesenhado).

**Conteúdo trocado (só texto/visual, nenhuma rota/lógica mudou):**
- Removido: os 3 pilares de confiança e a barra de alerta de risco imediato.
- Selo/eyebrow novo, título mantido (`config?.nome_canal`), parágrafo novo
  (continua vindo de `config?.mensagem_boas_vindas` com o novo texto como
  fallback — não virou hardcoded, só troquei o padrão).
- Botão primário → mesma rota de antes (`/relatar/categoria`), texto novo.
  Botão secundário → mesma rota de antes (`/consulta`), texto novo.
- Mantido: timbre (nome da empresa + "Sigilo garantido"), os 3 passos
  (Relato/Código/Retorno, mesmo conteúdo, só separei `num`/`título`/`desc`
  pra bater com a estrutura da referência), link de acesso da equipe.
- O chip da logo TIS que ficava no rodapé da Home **saiu** — a referência não
  tem esse elemento e a identidade da TIS já está toda no timbre do topo; o
  componente `LogoTIS.tsx` continua existindo e sendo usado no Login/sidebar
  do painel (fora de escopo deste prompt).

**Glass effect — correção pós-print.** Portei os valores exatos de
`backdrop-filter`/gradiente/sombra da referência (confirmado via
`getComputedStyle` no navegador: `blur(14px) saturate(1.6)`, idêntico ao
arquivo-fonte). O dono viu renderizado e perguntou "cadê o efeito glass" — o
motivo real: o painel esquerdo da própria referência é fundo liso
(`background:var(--cream)`, sem gradiente/textura atrás), e blur sobre cor
lisa não produz nada visível — a mesma limitação já existe no
`canalescutahomev3.html` original, não foi erro de porte. Corrigido
adicionando um glow radial dourado sutil atrás do hero (`.mahe-glow-warm` em
`index.css`, reusando a animação `mahe-orb-breathe` já criada pro painel
direito) — não está na referência, é acréscimo meu pra dar ao blur algo de
verdade pra desfocar. Com isso o botão secundário (mais translúcido, 42% de
opacidade branca) passa a mostrar o tingimento dourado desfocado atrás dele.

**Banner "Modo demonstração" removido do app inteiro** (`DemoBanner.tsx`
deletado, referência tirada de `App.tsx`) — pedido explícito do dono ao ver
o preview, escolhendo a opção "remover de vez" entre as alternativas
apresentadas (só nesta sessão / flag desligada por padrão / remover de vez).
Existia desde a fundação do projeto pra avisar que dado não persiste em
modo local (`MODO_DADOS==="local"`, antes da migração pro Supabase) — o
dono decidiu que não precisa mais disso.

Gate: `typecheck`/`lint` (mesmos 6 warnings de sempre, 0 erros)/`vitest` (20
testes)/`vite build` verdes. Testado no navegador em desktop (>921px, 2
colunas) e mobile (1 coluna), texto conferido palavra a palavra contra a
referência via `get_page_text`.

---

## 2026-09-02 — Novo sistema de design ("Documento, não spa")

Fonte de verdade: `designsystemescuta.html` (na raiz do projeto). Executando
`PROMPTEXECUCAOCANALESCUTA.txt` bloco a bloco.

### Bloco 0 — Diagnóstico

**a) Inventário de telas do fluxo público (colaborador/anônimo).** Todas as
telas foram abertas no dev server e capturadas. Nenhuma delas — além da Home,
já mockada — está hoje no novo sistema; todas usam o sistema visual antigo
(serifada decorativa + creme + verde + card arredondado):

| Rota | Componente | Estado hoje |
|---|---|---|
| `/` | `Home.tsx` | Já mockada (mensagem de urgência corrigida antes deste prompt) |
| `/apoio` | `ApoioImediato.tsx` | Sistema antigo — 3 cards de contato (CVV/Direitos Humanos/SAMU) |
| `/relatar/categoria` | `Categoria.tsx` | Sistema antigo — grid 2×4 de chips |
| `/relatar/urgencia` | `Urgencia.tsx` | Sistema antigo — 2 cards de opção + link discreto de apoio (lógica/tom já corretos, só a camada visual muda) |
| `/relatar/relato` | `Relato.tsx` | Sistema antigo — textarea, chip de categoria, anexo |
| `/relatar/revisao` | `Revisao.tsx` | Sistema antigo — 2 cards de resumo + toggle. **Não citada por nome no prompt, mas é claramente parte do fluxo** ("qualquer outra tela do fluxo") — incluída no Bloco 4. |
| `/relatar/protocolo` | `Protocolo.tsx` | Sistema antigo — ícone de check circular, código, aviso. É a tela de "confirmação/código de acompanhamento" citada no Bloco 0-a; reaplica o selo (Bloco 2-b). |
| `/consulta` | `Consulta.tsx` | Sistema antigo — 2 estados: formulário de código, e status (timeline + conversa + pesquisa de encerramento condicional) |

Total: **8 telas** no escopo do fluxo (Home + 7). O prompt cita nominalmente
Categoria/Urgência/Relato + "confirmação/código", "consulta de status",
"contatos de apoio" = 6; Revisão entra pela cláusula "qualquer outra tela do
fluxo".

**Fora de escopo, decisão explícita:** o painel da equipe (`/equipe/entrar`,
`/painel/*` — Login, VisãoGeral, CaixaDeCasos, CasoDetalhe, Relatórios,
Alertas, Configurações) **não é mencionado em nenhum bloco do prompt**. Não
será redesenhado nesta execução. Ele herda automaticamente as novas *cores*
porque consome os mesmos tokens semânticos Tailwind (`bg-card`,
`text-muted-foreground` etc. — ver Bloco 1 abaixo), mas seus componentes,
raios de borda específicos por tela e ícones não são tocados. Isso é
intencional, não descuido: não há pedido nem mockup pro painel. Se for pra
cobrir o painel também, é um prompt novo.

**b) Onde os tokens vivem hoje.**
- `src/index.css` — variáveis CSS em HSL (`--background`, `--foreground`,
  `--primary`, `--warning`, `--critical`, `--success` etc.), sob `:root` e
  `.dark` (dark mode nunca ativado por nenhum toggle — existe só como
  possibilidade futura).
- `tailwind.config.ts` — mapeia essas variáveis pra nomes de classe Tailwind
  (`bg-primary`, `text-muted-foreground`...), define `fontFamily` (display/
  body/mono) e a escala de raio (`lg`/`md`/`sh` derivados de `--radius`).
- Havia UM lugar central (correto), não espalhado — bom ponto de partida.

**c) Fonte externa — decisão sobre Google Fonts vs. self-host.**
**Não escolho um par de fontes de sistema — mantenho as MESMAS três fontes do
mockup (Source Serif 4, IBM Plex Sans, JetBrains Mono), mas via `@fontsource`
(self-host), não via `<link>` pro Google Fonts CDN como no
`designsystemescuta.html`.**

Isso não é uma escolha nova — é a aplicação de uma restrição já estabelecida
e registrada neste projeto: o app é um canal *anônimo* de denúncia, e uma
chamada de rede pro Google Fonts no primeiro paint entrega o IP de quem está
relatando ao Google antes mesmo de qualquer relato existir — fura o
requisito nº 1 do produto (anonimato). Essa é a mesma razão pela qual as
fontes atuais (Fraunces/Source Sans 3/IBM Plex Mono) já são self-hosted via
`@fontsource` desde a fundação do projeto. Troquei as família tipográficas,
não a arquitetura de carregamento. Verificado: `@fontsource/source-serif-4`,
`@fontsource/ibm-plex-sans` e `@fontsource/jetbrains-mono` existem no npm
(v5.3.0 cada).

**GATE 0 — cumprido.** Inventário completo, decisão de fonte resolvida
(mantém zero-request-externo), tokens confirmados como já centralizados.

---

### Bloco 1 — Fundamentos (tokens globais) — decisões de mapeamento

Os nomes de token do sistema (`ink`, `ink-2`, `record`, `paper`,
`paper-raised`, `paper-2`, `line`, `line-2`, `seal`, `seal-tint`,
`seal-line`, `signal`, `signal-tint`, `stamp`, `stamp-tint`) entram como
classes Tailwind novas (`bg-paper`, `text-ink-2`, `border-line` etc.) E os
tokens semânticos antigos (`background`, `foreground`, `card`, `primary`,
`muted-foreground`, `border`, `ring`...) continuam existindo como **alias**
pros novos valores, pra não quebrar o painel (fora de escopo, ver Bloco 0-a):

| Antigo | → | Novo | Por quê |
|---|---|---|---|
| `background` | → | `paper` | fundo base |
| `foreground` | → | `ink` | texto primário |
| `card` / `popover` | → | `paper-raised` | superfície elevada |
| `primary` | → | `seal` | única cor de ação |
| `primary-dark` | → | `seal` | sistema novo não tem 2 tons de ação — colapsa |
| `primary-soft` | → | `seal-tint` | fundo suave de destaque |
| `secondary` | → | `paper-2` | superfície secundária |
| `muted-foreground` | → | `ink-2` | texto secundário (ver ressalva abaixo) |
| `accent` | → | `seal-tint` / `seal` | estado de hover |
| `destructive` | → | `signal` | não usado no fluxo hoje; aliado por segurança |
| `border` | → | `line` | borda padrão (hairline) |
| `input` | → | `line-2` | borda de campo, levemente mais visível |
| `ring` | → | `seal` | anel de foco = cor de ação |
| `surface2` | → | `paper-2` | mesma função |
| `warning` / `warning-soft`, `success` / `success-soft` | mantidos, valores antigos | — | ver ressalva |

**Ressalva — `muted-foreground` tem dois papéis hoje, o sistema novo os
separa.** No código atual, `muted-foreground` cobre tanto "texto secundário
de prosa" (descrição sob um botão) quanto "metadado técnico" (código,
timestamp, rótulo mono). O sistema novo separa isso em `ink-2` (o primeiro
caso) e `record` (o segundo, sempre com `font-mono`). O alias genérico vai
pra `ink-2` (uso mais comum); nas telas que estou reescrevendo (Bloco 3/4),
uso `record` explicitamente onde o papel é de metadado — não confio no
alias genérico pra isso.

**Ressalva — `warning`/`success` não têm equivalente no sistema novo, e não
inveto um.** O sistema documenta 3 cores com função única: `seal` (ação),
`signal` (risco real, reservada), `stamp` (só o anel do selo). Não há uma
4ª cor pra "aviso médio" ou "sucesso" — inventar uma quebraria a disciplina
que é o ponto inteiro do sistema ("cada cor, uma função"). Então:
- **Pontos que hoje usam `warning`/`success` no fluxo são redesenhados sem
  cor de alarme**, usando estrutura/tipografia pra dar ênfase em vez de
  cor (ver Bloco 4-d abaixo — quadro de aviso do protocolo, confirmação de
  anexo).
- **Os tokens `warning`/`warning-soft`/`success`/`success-soft` continuam
  existindo com os valores ANTIGOS**, sem mudança — usados só pelo painel
  (badges de gravidade/status), que está fora de escopo. Não removo porque
  quebraria o painel; não redefino porque não há um valor "correto" no
  sistema novo pra eles.

**Raio — aplicado nos primitivos compartilhados, não só nas 8 telas.**
`Button`, `Input`, `Textarea` (usados pelo fluxo E pelo painel) passam a usar
os dois valores do sistema (`rounded` = 4px via escala padrão do Tailwind,
`rounded-xl` = 12px, já padrão do Tailwind — **nenhuma mudança em
`tailwind.config.ts` foi necessária pro raio**, porque `rounded-xl` e
`rounded` puro já batem com 12px/4px na escala nativa do Tailwind; só o
`borderRadius.lg/md/sm` customizado — usado por `Card` e outros primitivos
de shadcn não tocados neste prompt — continua com o valor antigo, porque
pertence a componentes do painel fora de escopo). Isso cai em cascata pro
painel (botões ficam com cantos um pouco mais retos) — efeito colateral
aceitável de um token verdadeiramente centralizado, não uma redecoração do
painel.

**Ícone — já resolvido na origem.** Os ícones do app são todos Lucide, que
já renderiza `fill="none" stroke="currentColor"` por padrão — a regra "traço
único, sem preenchimento" já valia antes deste prompt. Confirmado via busca:
nenhum ícone usa `fill=` com uma cor sólida no fluxo. Só ajusto a espessura
onde necessário (`stroke-width`) pra bater com 1.5–1.6px.

---

### Bloco 4-a — Raio dos botões de opção (categoria/urgência/pesquisa)

**Decisão: tratados como CONTÊINER (12px), não elemento pequeno.** Já usam
`rounded-xl` (12px) hoje. Critério: carregam mais de uma linha de conteúdo
(ícone/rótulo + descrição) e ocupam área substancial da tela — mais perto de
um card de opção do que de um chip de filtro. Aplicado de forma uniforme em
TODOS os botões de opção do fluxo: grid de categoria, cards de urgência,
emojis da pesquisa de encerramento em `Consulta.tsx`. Botões de AÇÃO
("Continuar", "Enviar relato", "Fazer um relato") continuam 4px — são
elemento pequeno de fato, e é isso que o mockup mostra
(`.esc-btn{border-radius:var(--r-sm)}`).

---

### Bloco 4-d — Onde `signal` pode aparecer (GATE 4 é explícito nisso)

Confirmado antes de tocar código: `signal` só nos dois pontos do prompt —
seleção "É urgente, risco imediato" em `Urgencia.tsx` e o link "Ver contatos
de apoio" (que aparece em duas telas: `Urgencia.tsx` e `Home.tsx` — conto
como o mesmo "ponto" reaparecendo, não um terceiro lugar novo). Isso
significa que o aviso de privacidade de anexo em `Relato.tsx` ("crachás,
nomes e rostos podem identificar você") e o aviso "guarde este código, não
há como recuperar" em `Protocolo.tsx` **não usam `signal`**, mesmo sendo
avisos — são reescritos com hierarquia tipográfica (não cor) fazendo o
trabalho de chamar atenção. Ver GATE 4 pra checagem final.

---

---

### Bloco 3 — Letterhead da Home × decisão anterior sobre a logo TIS

Tensão real, consultada com o gerente Opus antes de escrever código: o mockup
põe `TIS · Terminal Intermodal Sul` + `Sigilo garantido` como timbre no topo
da Home — parece contradizer a decisão anterior de manter a marca da TIS
discreta (só rodapé/login/sidebar), tomada por causa do risco de a logo do
empregador reduzir a confiança de quem vai denunciar.

**Resolvido: usa o letterhead, texto exato do mockup.** A decisão anterior
era sobre a **logo** (imagem/marca visual), não sobre o **nome por extenso**
— e o nome já aparecia duas vezes acima da dobra na Home antiga (subtítulo
grande sob o título + rodapé). O letterhead troca a ocorrência mais pesada
(subtítulo em corpo de texto) por uma linha mono de 8.5px — reduz a presença
da TIS na dobra de cima, não aumenta. E o par "TIS · Terminal Intermodal Sul"
+ "Sigilo garantido" na mesma linha lê como compromisso assinado, não como
vigilância — um canal NR-1 sem dono nomeado lê como formulário genérico,
pior pra confiança, não melhor.

Aplicado:
- Removido o subtítulo `<p>TIS — Terminal Intermodal Sul</p>` (linha 18 da
  Home antiga) — vira redundante.
- Letterhead novo: `TIS · Terminal Intermodal Sul` (esquerda, `record`) +
  `Sigilo garantido` (direita, `seal`), mono, uppercase.
- Rodapé com `LogoTIS` (chip pequeno) mantido exatamente como estava —
  a decisão original sobre a *logo* continua valendo integralmente.
- Só na Home. Categoria/Urgência/Relato não ganham letterhead — ali a
  pessoa já está escrevendo, e o custo de repetir o nome do empregador no
  topo não tem o mesmo ganho de enquadramento que tem na primeira tela.

**Achado fora de escopo, sinalizado pelo Opus:** em nenhum lugar do app (Home,
docs, README) fica dito quem efetivamente lê os relatos — se é alguém da TIS
ou uma consultoria externa (Mahê Psicologia). Isso é um buraco de confiança
maior do que qualquer decisão sobre onde o nome da TIS aparece, mas está fora
do escopo deste prompt (Bloco 3 não pede isso). Repasso ao dono no Bloco 5.

---

### Bloco 4-b — os "no máximo 2" usos de `signal` em Urgência

O GATE 4 diz "no máximo 2 [usos] na tela de urgência e no link de apoio" — li
isso como um teto que antecipa exatamente 2 usos na própria tela de Urgência,
não 1. Decisão: a opção **"É urgente, risco imediato"**, quando selecionada,
usa `signal`/`signal-tint` (não o `seal`/`seal-tint` genérico que toda outra
seleção do fluxo usa) — porque selecionar essa opção *é* o momento em que a
pessoa declara risco real, o mesmo fato que fez a caixa de alarme antiga
existir (removida antes deste prompt). Dar a esse estado uma cor diferente
das outras seleções é mais fiel a "risco real" do que deixar tudo com o
mesmo verde neutro. A opção "Não é urgente" continua com o `seal` padrão. O
link "Ver contatos de apoio", nesta tela e na Home, é o segundo/terceiro uso
— contados como o mesmo ponto reaparecendo (Bloco 4-d).

---

### Blocos 2, 3 e 4 — executados

- **Bloco 2 (selo):** `src/components/Selo.tsx`, componente único, SVG exato
  do mockup (anel externo `seal`, anel pontilhado `stamp`, check `seal`).
  Usado na Home (52px) e na tela de Protocolo (64px) — nenhum outro ícone de
  confirmação foi inventado.
- **Bloco 3 (Home):** `src/pages/colaborador/Home.tsx` reescrita — timbre,
  selo, título serifado, cláusulas numeradas, linha de procedimento, link de
  risco, rodapé. Ver decisão específica do timbre acima.
- **Bloco 4 (telas restantes):** `ApoioImediato`, `Categoria`, `Urgencia`,
  `Relato`, `Revisao`, `Protocolo`, `Consulta` (2 estados) — todas
  reescritas com os tokens/raio/tipografia do sistema novo. Indicador de
  progresso das 4 telas do fluxo (`Categoria`/`Urgencia`/`Relato`/`Revisao`)
  trocado de bolinhas pra "PASSO 0N DE 04" em `Tela.tsx` (componente
  compartilhado, uma mudança só, cascata pras 4 telas).

**Ícones de categoria (Bloco 4-a) — decisão de não inventar.** O prompt pede
"ícone de traço único em vez de preenchido" nos 8 botões de categoria, mas o
app **nunca teve ícones ali** — não há nada preenchido pra converter. Decidi
não adicionar pictogramas novos pra categorias sensíveis (assédio sexual,
discriminação etc.): não há indicação de quais ícones usar, e ilustrar esses
temas de forma respeitosa é genuinamente difícil — o próprio sistema é
tipográfico, não ilustrado (a Home não tem nenhum ícone decorativo além do
selo e do alerta de risco). Os ícones que **já existiam** (voltar, anexo,
check, copiar, enviar, alerta) foram mantidos — todos já são traço único do
Lucide, sem preenchimento, por padrão.

**Raio dos primitivos compartilhados.** `Button`/`Input`/`Textarea` (usados
pelo fluxo E pelo painel) passaram a `rounded` (4px, Tailwind padrão) em vez
de `rounded-lg/md` (10/8px, derivados de `--radius`). Isso é intencional —
raio é fundação global (Bloco 1), não por-tela — e é cosmético o bastante pra
não quebrar o painel (botões só ficam com cantos um pouco mais retos).

**Fontes globais.** Fraunces/Source Sans 3/IBM Plex Mono foram removidas do
projeto e substituídas por Source Serif 4/IBM Plex Sans/JetBrains Mono em
`tailwind.config.ts` (`font-display`/`font-body`/`font-mono`) — cascata
global, o painel também passa a usar a tipografia nova. Nenhum novo pacote
de fonte externo: todos via `@fontsource`, mesma arquitetura self-host de
antes (ver Bloco 0-c).

**Dark mode.** O bloco `.dark` de `src/index.css` foi removido (nunca era
ativado por nenhum toggle no app). Se dark mode for pedido no futuro, precisa
de uma paleta escura nova pro sistema "documento" — não existe no mockup.

### Gates — confirmados visualmente (prints no navegador, não só a olho)

- **GATE 0:** inventário completo das 8 telas do fluxo + decisão de fonte +
  tokens já centralizados — feito antes de tocar código.
- **GATE 1:** tokens aplicados, Home renderizada com as cores/fontes novas
  antes de tocar no layout — confirmado.
- **GATE 3:** Home renderizada e comparada ao mockup elemento a elemento —
  timbre, selo, título, cláusulas, procedimento, link de risco, rodapé —
  todos presentes e com os tokens corretos.
- **GATE 4:** todas as 8 telas do fluxo verificadas uma a uma no navegador
  (mobile 375px e desktop). Confirmado: só `rounded` (4px) e `rounded-xl`
  (12px) aparecem no fluxo; `signal` aparece em exatamente 3 lugares —
  seleção "urgente" + link de apoio na própria tela de Urgência (2, dentro
  do teto "no máximo 2 na tela") + o mesmo link repetido na Home (contado
  como o mesmo ponto reaparecendo); nenhum ícone com preenchimento fora do
  selo; gate de build (`tsc`, `eslint`, `vitest` — 20 testes, `vite build`)
  verde.

---

## Bloco 5 — pedido direto ao dono

1. **Fonte externa:** resolvida sem trocar pra fonte de sistema — Source
   Serif 4, IBM Plex Sans e JetBrains Mono continuam self-hosted via
   `@fontsource`, zero chamada de rede externa, preservando o requisito de
   anonimato. Não deveria precisar de confirmação, mas registro pra você
   saber que a decisão foi essa, não uma pendência.
2. **Telas do fluxo não previstas no prompt original, mas cobertas:** a tela
   de **Revisão** (`/relatar/revisao` — resumo antes de enviar, com o toggle
   "quero retorno") não é citada por nome no prompt, só entra pela cláusula
   "qualquer outra tela do fluxo". Apliquei o sistema nela também. Confirma
   se faz sentido, ou se ficou faltando alguma tela que eu não enumerei.
3. **Nenhum texto de anonimato, pergunta ou lógica de navegação foi
   alterado** — só a camada visual, do início ao fim. As únicas adições de
   *conteúdo* novo (não visual) são as 3 cláusulas numeradas e a linha de
   procedimento de 3 passos na Home — mas isso foi por instrução explícita
   do próprio prompt ("aplique exatamente... seção 5"), não uma decisão
   minha por conta própria; o texto é uma reafirmação factual de como o
   canal já funciona, não uma promessa nova.
4. **Achado fora de escopo (sinalizado pelo Opus, Bloco 3):** em nenhum
   lugar do app fica dito quem lê os relatos de fato — se é alguém da TIS ou
   a Mahê Psicologia (consultoria externa). Isso é um buraco de confiança
   maior do que qualquer decisão de design deste prompt, mas não estava no
   escopo pedido — só sinalizando pra você decidir se quer que eu resolva
   depois.
5. **Painel da equipe não foi tocado** (fora de escopo — ver Bloco 0-a). Ele
   herda as cores e fontes novas automaticamente (mesmos tokens), mas os
   componentes, raios de borda específicos e estrutura continuam como
   estavam. Se quiser o painel no mesmo sistema, é um prompt novo.
