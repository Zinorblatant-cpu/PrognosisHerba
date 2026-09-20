# 🧪 Documento de Testes Manuais — Sprint 3

**Projeto:** PrognosisHerba — Challenge CCR Motiva
**Versão testada:** Sprint 3 (protótipo funcional completo)
**Data de execução:** 19/09/2026

---

## 1. Ambiente de execução

| Item | Valor |
|---|---|
| Dispositivo | Emulador Android (Pixel 5, API 34) + aparelho físico Android |
| Build | Expo SDK 54 · React Native 0.81.5 · Expo Go |
| Origem dos dados | 100% mock local (AsyncStorage) — sem backend |
| Bundle | `npx expo export --platform android` → **864 módulos, 0 erros** |
| Testes automatizados | `npm test` → **179 testes, 18 suítes, 100% aprovados** |

### Como os cenários de erro e lista vazia foram provocados

A Sprint 3 introduziu o **Modo de demonstração** (Perfil → Modo de demonstração). Ele troca,
em tempo de execução, como a camada de mock responde:

| Cenário | Efeito na resposta dos services |
|---|---|
| ✅ Dados completos | Retorno normal (padrão do app) |
| 📭 Listas vazias | Services devolvem `[]` sem apagar o storage |
| ⚠️ Erro de conexão | Services lançam `MockApiError` (leitura e gravação) |
| 🐢 Resposta lenta | Atraso de 2,5 s em cada chamada |

Sem esse recurso não seria possível demonstrar, no app rodando, os estados de erro e de
lista vazia exigidos pela Sprint.

---

## 2. Legenda de status

| Status | Significado |
|---|---|
| ✅ Passou | Resultado obtido igual ao esperado |
| ⚠️ Passou com ressalva | Funciona, mas há um ponto anotado para a Sprint 4 |
| ❌ Falhou | Resultado diferente do esperado |

---

## Fluxo 1 — Cadastro e Login (autenticação)

| # | Cenário testado | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|
| 1.1 | Abrir o app sem sessão salva | App inicia na tela REGISTRAR | App abriu em REGISTRAR | ✅ Passou |
| 1.2 | Tocar em REGISTRAR com todos os campos vazios | Erro "Email é obrigatório" abaixo do campo e borda vermelha | Mensagem e borda exibidas; nenhuma navegação | ✅ Passou |
| 1.3 | Digitar `invalido` no email e enviar | Erro "Email inválido" | Mensagem exibida | ✅ Passou |
| 1.4 | Senha e confirmação diferentes | Erro "As senhas não coincidem" | Mensagem exibida | ✅ Passou |
| 1.5 | Cadastro válido (`maria@motiva.com` / `senha123`) | Conta gravada e navegação para LOGIN | Navegou para LOGIN; conta disponível para login | ✅ Passou |
| 1.6 | Cadastrar de novo o mesmo email | Erro "Este email já está cadastrado. Faça login." | Mensagem vermelha abaixo do botão | ✅ Passou |
| 1.7 | Tocar em "Já tenho conta. Entrar" | Vai para a tela de LOGIN | Navegou para LOGIN | ✅ Passou |
| 1.8 | Login com senha errada | Erro "Email ou senha incorretos. Verifique seus dados." e permanece na tela | Mensagem exibida; sessão não criada | ✅ Passou |
| 1.9 | Login com a conta de demonstração (`joao@motiva.com` / `senha123`) | Entra no Dashboard | Entrou no Dashboard com a saudação "Olá, João!" | ✅ Passou |
| 1.10 | Botão físico "voltar" do Android logo após o login | **Não** deve retornar à tela de Login | App saiu do aplicativo, como esperado (pilha resetada) | ✅ Passou |
| 1.11 | Fechar e reabrir o app depois de logado | Abre direto no Dashboard (sessão persistida) | Abriu no Dashboard | ✅ Passou |
| 1.12 | Tocar em "Não tem conta? Criar cadastro" na tela de Login | Vai para REGISTRAR | Navegou para REGISTRAR | ✅ Passou |

> **Observação honesta:** a autenticação é simulada. As senhas ficam em texto puro no
> AsyncStorage, o que é aceitável para um protótipo acadêmico sem backend, mas está
> listado como pendência para a Sprint 4.

---

## Fluxo 2 — Dashboard e navegação geral

| # | Cenário testado | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|
| 2.1 | Abrir o Dashboard | Saudação, atividades do dia, semana, trechos e resumo carregados | Todas as seções renderizaram | ✅ Passou |
| 2.2 | Badge do sino | Mostra a quantidade de notificações não lidas (3) | Badge vermelho com "3" sobre o sino | ✅ Passou |
| 2.3 | Tocar no sino 🔔 | Abre a tela de Notificações | Abriu Notificações | ✅ Passou |
| 2.4 | Tocar no ícone 👤 | Abre a tela de Perfil | Abriu Perfil | ✅ Passou |
| 2.5 | Tocar no card "Poda" | Abre "Confirmar Poda" | Abriu a tela correta | ✅ Passou |
| 2.6 | Tocar no card "Não Poda" | Abre "Informar Ausência" | Abriu a tela correta | ✅ Passou |
| 2.7 | Tocar em "Ver calendário" | Abre a Agenda da Semana | Abriu a Agenda | ✅ Passou |
| 2.8 | Tocar em qualquer item de "Atividades da Semana" | Abre a Agenda da Semana | Abriu a Agenda | ✅ Passou |
| 2.9 | Tocar no card "Trechos da Rodovia" | Abre a lista de trechos | Abriu a lista | ✅ Passou |
| 2.10 | Voltar ao Dashboard após confirmar a poda | Card "Poda" mostra "Confirmada • 07:00 - 12:00" em verde | Texto atualizado ao ganhar foco | ✅ Passou |
| 2.11 | Voltar ao Dashboard após ler notificações | Badge do sino diminui / some | Badge atualizado | ✅ Passou |
| 2.12 | Tocar em "Sair" | Sessão apagada e volta para REGISTRAR sem opção de voltar | Sessão limpa; pilha resetada | ✅ Passou |

> **Correção da Sprint 2:** antes, **nenhum** desses elementos tinha ação — sino, "Ver
> calendário", cards "Poda"/"Não Poda" e itens da semana eram `TouchableOpacity` sem
> `onPress`. Todos foram ligados nesta Sprint.

---

## Fluxo 3 — Trechos da Rodovia (lista, GPS e previsão de IA)

| # | Cenário testado | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|
| 3.1 | Abrir a lista | Indicador de carregamento e depois os 5 trechos | Spinner → lista carregada | ✅ Passou |
| 3.2 | Ordenação | Urgente → Atenção → Não necessária | Jundiaí e Cotia (Urgente) no topo | ✅ Passou |
| 3.3 | Selo de status | Cada card mostra 🟢/🟡/🔴 + o status | Selos corretos | ✅ Passou |
| 3.4 | Selo de IA | Mostra nível e % de confiança | Ex.: "🤖 IA: 🔴 Urgente • 94% de confiança" | ✅ Passou |
| 3.5 | Permissão de localização (1ª abertura em aparelho físico) | Diálogo do sistema pedindo acesso ao GPS | Diálogo exibido com o texto do `app.json` | ✅ Passou |
| 3.6 | Permissão concedida | Mostra as coordenadas e marca "📍 Mais próximo de você" | Coordenadas exibidas e trecho mais próximo marcado | ✅ Passou |
| 3.7 | Permissão negada | Mostra "📍 Localização indisponível" e a lista continua funcionando | Mensagem exibida; lista normal, sem selo de proximidade | ✅ Passou |
| 3.8 | Filtrar por "🔴 Crítico" | Mostra apenas os trechos críticos e atualiza o contador do cabeçalho | 2 de 5 trechos exibidos | ✅ Passou |
| 3.9 | Filtrar por um status sem resultados | Estado vazio "Nenhum trecho com esse status" + botão LIMPAR FILTRO | Estado e botão exibidos; botão restaurou a lista | ✅ Passou |
| 3.10 | Puxar a lista para baixo | Recarrega os dados (pull-to-refresh) | Lista recarregada | ✅ Passou |
| 3.11 | Cenário 📭 "Listas vazias" | Estado "Nenhum trecho monitorado" | Estado vazio exibido; filtros escondidos | ✅ Passou |
| 3.12 | Cenário ⚠️ "Erro de conexão" | Estado de erro + botão TENTAR NOVAMENTE | Erro exibido com a mensagem da API simulada | ✅ Passou |
| 3.13 | Voltar ao cenário normal e tocar em TENTAR NOVAMENTE | Lista carrega normalmente | Lista restaurada | ✅ Passou |
| 3.14 | Cenário 🐢 "Resposta lenta" | Spinner visível por ~2,5 s antes da lista | Estado de carregamento visível | ✅ Passou |

---

## Fluxo 4 — Detalhe do trecho: inspeção e feedback da IA

| # | Cenário testado | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|
| 4.1 | Abrir um trecho pela lista | Dados, previsão de IA, formulários e histórico | Tela completa carregada | ✅ Passou |
| 4.2 | Bloco de IA | Nível, confiança (%) e motivo da classificação | Os três campos exibidos | ✅ Passou |
| 4.3 | Registrar inspeção sem escolher status | Erro "Selecione o status de vegetação do trecho." | Mensagem exibida; nada gravado | ✅ Passou |
| 4.4 | Registrar inspeção sem observação | Erro "Descreva a observação da inspeção antes de registrar." | Mensagem exibida; nada gravado | ✅ Passou |
| 4.5 | Registrar inspeção válida | Status atualizado, entrada no topo do histórico, campo limpo e confirmação em verde | Tudo conforme o esperado | ✅ Passou |
| 4.6 | Voltar para a lista após a inspeção | O card do trecho reflete o novo status e a nova data | Lista atualizada ao ganhar foco | ✅ Passou |
| 4.7 | Salvar feedback sem responder as duas perguntas | Erro "Responda as duas perguntas antes de salvar o feedback." | Mensagem exibida | ✅ Passou |
| 4.8 | Salvar feedback completo | Confirmação "Feedback registrado em AAAA-MM-DD" | Confirmação exibida | ✅ Passou |
| 4.9 | Sair do trecho e voltar | O feedback salvo continua marcado | Estado preservado (AsyncStorage) | ✅ Passou |
| 4.10 | Cenário ⚠️ "Erro de conexão" ao registrar inspeção | Mensagem de falha e **nada** é gravado | Erro exibido; status do trecho inalterado | ✅ Passou |
| 4.11 | Abrir um trecho inexistente (via notificação de trecho removido) | Estado de erro "Trecho não encontrado" com TENTAR NOVAMENTE | Estado de erro exibido | ✅ Passou |

> **Correção da Sprint 2:** a lista de trechos não se atualizava ao voltar do detalhe — a
> inspeção registrada só aparecia depois de reabrir o app. Corrigido com recarga ao foco.

---

## Fluxo 5 — Atividades do dia: confirmar poda e informar ausência

| # | Cenário testado | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|
| 5.1 | Abrir "Confirmar Poda" | Lista de turnos (Manhã / Integral / Tarde) e campo de observação | Tela carregada | ✅ Passou |
| 5.2 | Confirmar sem escolher turno | Erro "Selecione o turno da poda para continuar." | Mensagem exibida | ✅ Passou |
| 5.3 | Confirmar com turno selecionado | Confirmação em verde + botão VER NA AGENDA | Confirmação e atalho exibidos | ✅ Passou |
| 5.4 | Tocar em VER NA AGENDA | Abre a Agenda com o dia marcado como "✂️ Confirmada" | Agenda atualizada | ✅ Passou |
| 5.5 | Abrir "Informar Ausência" | Lista de 5 motivos + campo de justificativa | Tela carregada | ✅ Passou |
| 5.6 | Enviar sem escolher motivo | Erro "Selecione o motivo da ausência para continuar." | Mensagem exibida | ✅ Passou |
| 5.7 | Escolher "Outro motivo" sem escrever nada | Erro "Descreva a justificativa para o motivo 'Outro motivo'." | Mensagem exibida | ✅ Passou |
| 5.8 | Registrar ausência com motivo + justificativa | Confirmação e dia marcado como "🚫 Ausência justificada" na agenda | Agenda atualizada | ✅ Passou |
| 5.9 | Abrir "Confirmar Poda" depois de já ter informado ausência | Aviso de conflito explicando que a poda substitui a ausência | Card de aviso exibido no topo | ✅ Passou |
| 5.10 | Reabrir a tela após registrar | A escolha anterior aparece pré-selecionada | Seleção e texto restaurados | ✅ Passou |
| 5.11 | Cenário ⚠️ "Erro de conexão" ao confirmar | Mensagem de falha; nada gravado na agenda | Erro exibido; agenda inalterada | ✅ Passou |

---

## Fluxo 6 — Agenda da Semana

| # | Cenário testado | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|
| 6.1 | Abrir a agenda | 5 dias (15 a 19 de junho) com turno, equipe, trecho e status | Escala completa carregada | ✅ Passou |
| 6.2 | Destaque do dia atual | O dia de hoje tem borda verde e a etiqueta "HOJE" | Destaque aplicado | ✅ Passou |
| 6.3 | Variedade de status | Concluída, Programada e Ausência justificada aparecem | Os três status presentes no mock | ✅ Passou |
| 6.4 | Tocar em "Ver detalhe do trecho ›" | Abre o detalhe do trecho daquele dia | Navegou corretamente | ✅ Passou |
| 6.5 | Dia sem trecho alocado (ausência) | Não exibe o atalho de trecho | Atalho ausente, como esperado | ✅ Passou |
| 6.6 | Puxar para baixo | Recarrega a escala | Escala recarregada | ✅ Passou |
| 6.7 | Cenário 📭 "Listas vazias" | Estado "Nenhuma diária programada" | Estado vazio exibido | ✅ Passou |
| 6.8 | Cenário ⚠️ "Erro de conexão" | Estado de erro + TENTAR NOVAMENTE | Erro exibido e recuperação funcionando | ✅ Passou |

---

## Fluxo 7 — Notificações

| # | Cenário testado | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|
| 7.1 | Abrir a tela | 5 notificações com tipo, título, mensagem e data | Lista carregada | ✅ Passou |
| 7.2 | Marcação de não lidas | Notificações não lidas com barra verde à esquerda e ponto verde | Destaque aplicado nas 3 não lidas | ✅ Passou |
| 7.3 | Contador do cabeçalho | Mostra "3 não lida(s) de 5" | Contador correto | ✅ Passou |
| 7.4 | Tocar em uma notificação com trecho | Marca como lida e abre o detalhe do trecho | Navegou e marcou como lida | ✅ Passou |
| 7.5 | Tocar em uma notificação sem trecho | Marca como lida e permanece na tela | Comportamento correto | ✅ Passou |
| 7.6 | Tocar em MARCAR TODAS COMO LIDAS | Confirmação em verde e o botão some | Confirmação exibida; contador zerado | ✅ Passou |
| 7.7 | Voltar ao Dashboard | Badge do sino desaparece | Badge removido | ✅ Passou |
| 7.8 | Cenário 📭 "Listas vazias" | Estado "Nenhuma notificação por aqui" | Estado vazio exibido | ✅ Passou |
| 7.9 | Cenário ⚠️ "Erro de conexão" | Estado de erro + TENTAR NOVAMENTE | Erro exibido e recuperação funcionando | ✅ Passou |

---

## Fluxo 8 — Perfil e Modo de demonstração

| # | Cenário testado | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|
| 8.1 | Abrir o Perfil | Avatar, nome, cargo e dados operacionais do usuário logado | Dados exibidos | ✅ Passou |
| 8.2 | Perfil de conta criada no cadastro | Nome derivado do email + dados operacionais do mock | Perfil preenchido corretamente | ✅ Passou |
| 8.3 | Trocar o cenário de mock | Confirmação na tela indicando qual cenário foi aplicado | Mensagem exibida | ✅ Passou |
| 8.4 | Cenário persistido | Fechar e reabrir o app mantém o cenário escolhido | Cenário preservado | ✅ Passou |
| 8.5 | RESTAURAR DADOS DE DEMONSTRAÇÃO | Trechos, agenda, notificações e cenário voltam ao original | Tudo restaurado | ✅ Passou |
| 8.6 | SAIR DA CONTA | Sessão apagada e volta para REGISTRAR | Logout concluído | ✅ Passou |

---

## 3. Resumo dos resultados

| Fluxo | Casos | ✅ | ⚠️ | ❌ |
|---|---|---|---|---|
| 1 — Cadastro e Login | 12 | 12 | 0 | 0 |
| 2 — Dashboard e navegação | 12 | 12 | 0 | 0 |
| 3 — Trechos, GPS e IA | 14 | 14 | 0 | 0 |
| 4 — Inspeção e feedback | 11 | 11 | 0 | 0 |
| 5 — Poda / Ausência | 11 | 11 | 0 | 0 |
| 6 — Agenda | 8 | 8 | 0 | 0 |
| 7 — Notificações | 9 | 9 | 0 | 0 |
| 8 — Perfil e mock | 6 | 6 | 0 | 0 |
| **Total** | **83** | **83** | **0** | **0** |

Nenhum crash, tela travada ou navegação quebrada foi observado durante a execução.

---

## 4. Pontos de melhoria identificados para a Sprint 4

Estes itens **não** são falhas dos testes acima — são limitações conscientes do protótipo,
anotadas de forma honesta para o planejamento da próxima Sprint.

| # | Ponto identificado | Onde | Prioridade |
|---|---|---|---|
| P1 | Autenticação é simulada; senhas ficam em texto puro no AsyncStorage | `AuthService` | Alta |
| P2 | Não há API real — toda a persistência é local, sem sincronização entre aparelhos | Todos os services | Alta |
| P3 | A previsão de IA é um campo estático do mock, sem modelo real por trás | `trechosMock` | Alta |
| P4 | A data "hoje" da agenda é fixa (16/06/2026) para manter o mock coerente | `agendaMock` | Média |
| P5 | Não existe recuperação de senha ("Esqueci minha senha") | `LoginScreen` | Média |
| P6 | O feedback do podador é gravado, mas não há tela que consolide o acerto da IA | — | Média |
| P7 | Sem tratamento de modo offline explícito (fila de sincronização) | Todos os services | Média |
| P8 | Sem foto/anexo na inspeção — só texto | `TrechoDetailScreen` | Média |
| P9 | Sem mapa visual dos trechos; o GPS só calcula distância | `TrechosScreen` | Baixa |
| P10 | O "Modo de demonstração" precisa sair (ou virar flag de build) na versão final | `PerfilScreen` | Baixa |
| P11 | Acessibilidade: falta revisão de contraste e de leitores de tela | Todas as telas | Baixa |
| P12 | Sem testes E2E (Detox/Maestro) — a cobertura automatizada é de unidade/componente | `__tests__` | Baixa |

---

## 5. Testes automatizados de apoio

Além da bateria manual acima, o projeto mantém a suíte automatizada como rede de
segurança. Resultado da execução (`npm test`):

```
Test Suites: 18 passed, 18 total
Tests:       179 passed, 179 total
```

| Suíte | O que cobre |
|---|---|
| `AppNavigation.test.js` | Redirecionamento por sessão salva |
| `AuthService.test.js` | Sessão, cadastro, login, credenciais inválidas, perfil |
| `TrechosService.test.js` | Mock de trechos, inspeções e feedback |
| `LocationService.test.js` | Permissão de GPS e cálculo de distância |
| `MockScenarioService.test.js` | Os 4 cenários de mock e seu efeito nos trechos |
| `AgendaService.test.js` | Escala, confirmação de poda, ausência e cenários |
| `NotificacoesService.test.js` | Listagem, leitura, contador e cenários |
| `RegisterScreen.test.js` / `LoginScreen.test.js` | Validações e autenticação |
| `DashboardScreen.test.js` / `DashboardHeader.test.js` | Conteúdo, badge e navegação |
| `TrechosScreen.test.js` / `TrechosScreenEstados.test.js` | Lista, IA, GPS, filtros e estados |
| `TrechoDetailScreen.test.js` | Inspeção, feedback e histórico |
| `AgendaScreen.test.js` | Escala, estados e navegação |
| `NotificacoesScreen.test.js` | Lista, leitura e estados |
| `RegistrarPodaScreen.test.js` | Fluxos de poda e de ausência |
| `PerfilScreen.test.js` | Perfil, cenários de mock e logout |
