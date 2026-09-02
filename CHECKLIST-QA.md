# Checklist de QA — percorrer no `npm run preview` (ou `dev`)

Marque cada item. Nenhum botão pode ficar preso em "carregando" nem levar a tela morta.

## Colaborador — relato

- [ ] `/` abre: nome do canal, texto de anonimato, "Fazer um relato", "Já enviei — consultar status", link "Está em risco agora?".
- [ ] Banner "MODO DEMONSTRAÇÃO" aparece e o X fecha (fica fechado ao recarregar).
- [ ] "Está em risco agora?" → `/apoio` com CVV 188, Disque 100, SAMU 192; cada card liga (`tel:`); voltar funciona.
- [ ] "Fazer um relato" → categoria. "Continuar" só habilita depois de escolher uma.
- [ ] Urgência: escolher "É urgente" mostra a caixa vermelha com 188/100; dá pra continuar mesmo assim.
- [ ] Relato: "Revisar" só habilita com ≥ 10 caracteres.
- [ ] Anexar imagem: JPG/PNG/WEBP aceita e mostra "metadados removidos"; PDF é recusado com mensagem; some com o X.
- [ ] Revisão mostra categoria + texto; toggle "quero retorno" alterna.
- [ ] "Enviar relato" → tela de protocolo `CE-AAAA-XXXX-XXXX`; "Copiar código" funciona; aviso de que não há como recuperar.
- [ ] "Voltar ao início" limpa o wizard (recomeçar do zero não traz texto antigo).
- [ ] Recarregar em `/relatar/relato` sem categoria redireciona para `/relatar/categoria`.

## Colaborador — consulta

- [ ] `/consulta`: código incompleto → toast "formato CE-AAAA-XXXX-XXXX", não avança.
- [ ] Código inexistente → mensagem genérica de "não encontrado" (não diz se existe).
- [ ] Código válido → timeline de 4 etapas com a etapa certa destacada + conversa.
- [ ] Enviar mensagem como anônimo aparece na hora, alinhada à direita.
- [ ] Caso concluído + pesquisa ativa → aparece a pesquisa (3 emojis + comentário); enviar registra e some; reenviar não duplica.
- [ ] Voltar (seta) volta para o campo de código; recarregar a página não mantém o protocolo (só `sessionStorage`, limpo ao sair).

## Equipe — acesso

- [ ] `/painel` sem sessão → redireciona para `/equipe/entrar` (sem piscar conteúdo).
- [ ] Login errado → "E-mail ou senha inválidos.". Login certo → Visão Geral.
- [ ] Recarregar (F5) dentro do painel **não** joga para o login.
- [ ] "Sair" volta ao login; `/painel` volta a ser bloqueado.
- [ ] Mobile (≤ 768px): topo com ☰ abre o menu lateral; navegar fecha o menu.

## Equipe — Visão Geral

- [ ] 4 indicadores (abertos, tempo médio 1ª resposta, fora do prazo, % ouvidos).
- [ ] Mapa de risco ordenado da categoria mais frequente para a menos.
- [ ] Gráfico de 6 meses; o mês atual em destaque.
- [ ] Badge vermelho na "Caixa de Casos" = nº de casos fora do prazo, e bate com o indicador.

## Equipe — Caixa de Casos

- [ ] Lista com protocolo, categoria, gravidade, status, prazo. Casos vencidos com prazo em vermelho.
- [ ] Cada filtro (status, categoria, gravidade, setor) reduz a lista; combinados também.
- [ ] Filtro sem resultado → linha "Nenhum caso com esses filtros.".
- [ ] Clicar numa linha abre o detalhe.

## Equipe — Detalhe do caso

- [ ] Relato, e anexo (imagem abre em nova aba) quando houver.
- [ ] Nota interna: salvar adiciona à lista; não aparece para o colaborador na consulta.
- [ ] Conversa: enviar resposta aparece na hora; se o caso estava "recebido" vira "em andamento".
- [ ] Reclassificar categoria/gravidade salva; mudar gravidade recalcula o prazo (some/entra em atraso na lista).
- [ ] "Marcar em triagem" / "em andamento" muda o status e some da lista de opções o status atual.
- [ ] "Encaminhar ao RH/jurídico" marca a tag e desabilita o botão.
- [ ] "Encerrar caso" muda para Concluído; na consulta do colaborador a pesquisa de encerramento passa a aparecer.
- [ ] Voltar à caixa reflete todas as mudanças (status, prazo) sem recarregar.

## Equipe — Alertas

- [ ] Tabela de regras legível.
- [ ] "Caixa de saída": todo caso criado com urgência alta / categoria imediata gera uma linha com assunto, corpo, destinatário e horário.

## Equipe — Relatórios

- [ ] Resumo do mês corrente com números reais.
- [ ] "Exportar PDF" abre a caixa de impressão; no preview do PDF só sai o cartão do relatório (sem menu/sidebar).
- [ ] Histórico lista os meses anteriores.

## Equipe — Configurações

- [ ] Editar nome/domínio/mensagem e "Salvar" → toast de sucesso; a Home do colaborador reflete o novo nome/mensagem.
- [ ] Desativar uma categoria e salvar → ela some da tela de seleção do colaborador.
- [ ] Os 3 toggles salvam.
- [ ] "Restaurar dados de demonstração" recarrega tudo do zero.

## Build / PWA

- [ ] `npm run build` sem erro; `npm run preview` e o app abre igual.
- [ ] DevTools > Application: manifest com nome "Canal de Escuta", tema `#2C5F5A`, ícones 192/512; service worker ativo **só** no preview/prod, não em `dev`.
- [ ] Recarregar qualquer rota profunda (ex.: `/painel/casos`) no preview não dá 404.
- [ ] Console sem erros em nenhuma tela.
