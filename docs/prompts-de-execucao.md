# Prompts de execução — Canal de Escuta

Sete prompts, na ordem certa, para colar um de cada vez no Lovable (ou no Claude, se for direto por lá) — mesma lógica de construção em fases que vocês já usaram no DRPS. Espere cada um terminar de construir e testar antes de colar o próximo; não cole todos de uma vez.

**Antes de começar:** suba junto o blueprint técnico, o protótipo v2 e o plano de execução como referência de contexto — servem para o Lovable "ver" o fluxo e a direção visual já validados, em vez de inventar do zero. Isso cobre a Fase 1 (MVP) inteira do plano de execução. Os itens da Fase 0 (empresa-cliente definida, DPA assinado, política validada por advogado) não bloqueiam construir e testar — mas bloqueiam colocar isso na frente de funcionários de verdade.

---

## Prompt 1 — Fundação (schema + configuração do projeto)

```
Vamos criar um projeto novo: um PWA anônimo chamado "Canal de Escuta", canal de escuta e denúncias corporativas para uma empresa-cliente, construído com React + TypeScript + Vite + Tailwind, com Supabase como backend. Este projeto é independente de qualquer outro projeto que eu tenha — banco de dados e código totalmente novos.

Contexto do produto: colaboradores de uma empresa relatam de forma anônima situações de assédio, discriminação, sobrecarga, conflitos e sugestões de melhoria. Uma equipe de psicologia (a "equipe de escuta") trata os casos. O anonimato é o requisito mais importante do projeto — em nenhum momento o sistema deve pedir login, e-mail ou coletar dado que identifique quem relata.

Configure primeiro a base de dados e a estrutura do projeto:

1. Habilite suporte a PWA (manifest.json instalável, ícone de app, service worker básico).
2. Crie as tabelas no Supabase:
   - empresas (id, nome, dominio, criado_em) — mesmo servindo uma única empresa agora, crie essa tabela e todas as outras com empresa_id, para não termos que reescrever o schema se replicarmos o produto no futuro.
   - casos (id, empresa_id, protocolo_hash, protocolo_display, categoria, gravidade, status, canal_origem, relato, quer_retorno boolean, criado_em, sla_prazo)
   - mensagens_caso (id, caso_id, remetente enum('equipe','anonimo'), conteudo, criado_em)
   - anexos (id, caso_id, storage_path, tipo, tamanho, criado_em)
   - historico_status (id, caso_id, status_anterior, status_novo, responsavel, criado_em)
   - equipe_clinica (id, user_id referenciando auth.users, nome, empresa_id, papel)
3. Configure Row Level Security assim:
   - Qualquer pessoa (anon) pode fazer INSERT em casos, mensagens_caso e anexos, mas nunca SELECT, UPDATE ou DELETE nessas tabelas.
   - Apenas usuários autenticados presentes na tabela equipe_clinica podem fazer SELECT/UPDATE em casos, mensagens_caso, anexos e historico_status.
   - Nenhuma política pode expor dados de uma empresa para outra (filtrar sempre por empresa_id).
4. Não instale nenhuma ferramenta de analytics de terceiros (Google Analytics, Meta Pixel, GTM) neste projeto — é uma exigência de anonimato, não um detalhe.
5. Direção visual: paleta em tom verde-petróleo (#2C5F5A como cor primária) sobre fundo claro neutro (#F1F4F1), tipografia serifada (Fraunces ou parecida) para títulos e sans-serif (Source Sans 3 ou parecida) para texto corrido, com uma fonte monoespaçada para códigos de protocolo. Veja os arquivos em anexo (protótipo e blueprint) como referência visual e de fluxo — não precisa ser pixel-perfect, mas mantenha a mesma linguagem visual.

Não construa nenhuma tela ainda — este prompt é só a fundação de dados e configuração do projeto.
```

---

## Prompt 2 — App do colaborador (fluxo de relato)

```
Continuando o projeto Canal de Escuta: agora construa o fluxo completo de quem relata, como um PWA mobile-first (mas responsivo em desktop).

Telas, nesta ordem:
1. Início — nome do canal, texto reforçando que não há login nem coleta de identidade, botão "Fazer um relato" e botão "Já enviei — consultar status". Inclua, sempre visível, um link discreto "Está em risco agora? Ver contatos de apoio imediato".
2. Contatos de apoio imediato — CVV (188), Disque Direitos Humanos (100), SAMU (192), com descrição curta de cada um.
3. Categoria — grade de opções: Assédio moral, Assédio sexual, Discriminação, Sobrecarga/jornada, Conflito com colega, Falta de reconhecimento, Segurança no trabalho, Sugestão de melhoria. Seleção única, obrigatória para continuar.
4. Urgência — pergunta se a situação é urgente/risco imediato ou não. Se marcar "urgente", mostrar imediatamente o aviso com os contatos de apoio (188/100), sem impedir que a pessoa continue o relato normalmente depois.
5. Relato — campo de texto livre (obrigatório) e opção de anexar uma imagem (opcional). Ao processar o upload, remova metadados EXIF antes de enviar ao Storage.
6. Revisão — mostra categoria e o texto digitado, com um toggle "Quero receber retorno pelo protocolo" (ligado por padrão), e reforça que nenhum dado de identificação será salvo.
7. Confirmação — gera um protocolo no formato CE-{ano}-{4 caracteres alfanuméricos maiúsculos} do lado do servidor (Edge Function, nunca no cliente), mostra o código em destaque com aviso de que é a única forma de acompanhar o caso depois, e insere o registro em `casos` com status inicial "recebido".

Regra importante: nenhuma tela pode registrar IP, user-agent, geolocalização ou qualquer identificador de dispositivo em nenhuma tabela ou log de analytics.
```

---

## Prompt 3 — Consulta, mensageria e encerramento

```
Continuando o Canal de Escuta: construa a jornada de acompanhamento de quem relatou, sempre por protocolo, nunca por login.

1. Tela "Consultar meu relato" — campo para digitar o código do protocolo, valida contra o protocolo_hash no banco (não contra o texto puro).
2. Tela de status — mostra uma linha do tempo com 4 etapas (Recebido, Triagem, Em andamento, Concluído, destacando a etapa atual), e a conversa trocada com a equipe (tabela mensagens_caso), com campo para a pessoa responder. Cada nova mensagem da pessoa entra como remetente 'anonimo', sem nenhum vínculo com identidade.
3. Quando o status do caso for "Concluído", ao final da tela mostrar uma pesquisa de encerramento: 3 opções (não fui ouvido / em parte / fui levado a sério) e um campo de comentário final opcional — ambos anônimos, gravados numa tabela nova `pesquisa_encerramento` (caso_id, avaliacao, comentario, criado_em).

Garanta que consultar um protocolo errado não revele se ele existe ou não de forma que dê para adivinhar protocolos por tentativa — trate como "protocolo não encontrado" de forma genérica.
```

---

## Prompt 4 — Autenticação da equipe e estrutura do painel

```
Continuando o Canal de Escuta: agora construa o lado administrativo, para a equipe de psicologia que trata os casos.

1. Autenticação real via Supabase Auth (e-mail/senha), restrita a quem está cadastrado na tabela equipe_clinica — qualquer outra conta não deve conseguir acessar o painel.
2. Layout do painel: barra lateral fixa com 5 itens de navegação — Visão Geral, Caixa de Casos, Relatórios, Alertas, Configurações — e um indicador do usuário logado no rodapé da barra.
3. Construa agora a Caixa de Casos:
   - Lista de casos com filtros por status, categoria, gravidade e setor, mostrando protocolo, categoria, gravidade (badge colorido: crítica/média/baixa), status (badge) e prazo restante do SLA.
   - Ao clicar num caso, abrir o detalhe: relato completo, um campo de "nota interna" (visível só para a equipe, nunca para quem relatou — tabela separada `notas_internas`), a conversa por protocolo com campo de resposta, e os campos para reclassificar categoria/gravidade.
   - Botões de ação: "Encaminhar ao RH/jurídico" (marca encaminhado = true e muda status) e "Encerrar caso" (muda status para Concluído e libera a pesquisa de encerramento na próxima consulta da pessoa).
   - Toda mudança de status deve gravar uma linha em historico_status.
```

---

## Prompt 5 — Visão Geral

```
Continuando o Canal de Escuta: construa a aba Visão Geral do painel.

- Quatro indicadores no topo: casos abertos, tempo médio até a primeira resposta da equipe, casos fora do prazo de SLA, e percentual de "fui levado a sério" a partir da tabela pesquisa_encerramento.
- Um "mapa de risco por categoria": lista das categorias com barra proporcional ao número de casos de cada uma no período, ordenada da mais para a menos frequente.
- Um gráfico de barras simples de casos por mês, últimos 6 meses.
- Todos os números devem vir de consultas reais às tabelas casos e pesquisa_encerramento, filtradas por empresa_id — nada fixo/hardcoded.
```

---

## Prompt 6 — Alertas

```
Continuando o Canal de Escuta: construa a aba Alertas, que resolve como a equipe é avisada de um caso novo sem depender de abrir o painel.

1. Uma tabela de regras (pode começar fixa em código, sem precisar ser editável ainda):
   - Assédio sexual ou urgência marcada como crítica → notificar imediatamente
   - Discriminação → notificar imediatamente
   - Assédio moral e conflito → resumo diário
   - Sobrecarga e sugestão → resumo semanal
2. Implemente o envio por e-mail (via uma Edge Function chamando um provedor transacional, ex.: Resend) disparado na criação de um caso que se enquadre na regra "imediato".
3. Deixe um ponto de extensão claro (função separada, bem comentada) para o envio por WhatsApp do nível crítico — ainda não implemente a integração do WhatsApp Business API em si, só estruture para onde ela vai entrar depois.
4. A tela em si deve mostrar essa tabela de regras de forma legível para a equipe, mesmo que a edição ainda não seja funcional nesta fase.
```

---

## Prompt 7 — Relatórios e Configurações

```
Continuando o Canal de Escuta, finalize com as duas últimas abas do painel.

Relatórios:
- Gerar um resumo do mês corrente: total de relatos, casos em aberto, casos em atraso, distribuição por categoria, número de casos encaminhados, e o percentual de "fui levado a sério" da pesquisa de encerramento.
- Botão para exportar esse resumo como PDF.
- Lista dos relatórios de meses anteriores já gerados.

Configurações:
- Nome público do canal, domínio de acesso, mensagem de boas-vindas da tela inicial (editáveis e persistidos numa tabela configuracoes_canal).
- Lista de categorias ativas, com opção de adicionar uma nova.
- Toggles: permitir anexos, permitir mensagens após o caso encerrado, pesquisa de encerramento ativada.

Depois deste prompt, o MVP completo (Fase 1 do plano de execução) está pronto para ser testado com uma empresa piloto.
```

---

## Depois dos 7 prompts

O que fica de fora de propósito, porque depende de decisões que ainda estão em aberto (seção "Falta decidir" do plano de execução): integração real de WhatsApp para o alerta crítico, empresa-cliente e domínio definitivos, e a política pública do canal validada por advogado. Resolver isso é o que separa "MVP funcionando em teste" de "canal em produção com colaboradores reais".
