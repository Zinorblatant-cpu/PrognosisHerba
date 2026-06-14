# PrognosisHerba

App mobile para gestão e monitoramento de atividades de poda de vegetação nas rodovias concedidas da **CCR Motiva**, desenvolvido como solução para o **Challenge CCR Motiva — Sprint 1**.

---

## Integrantes

| Nome | RM |
|------|----|
| Lucas Ferrari Lima | 563119 |
| Carlos Eduardo Pires Cervelli | 563462 |
| Felipe Krzyzanovski dos Santos Menezes | 564878 |
| Leonardo Lopes Oliveira | 565437 |
| Arthur de Souza Matos Dias | 566068 |
| Guilherme Carreri Giampietro | 565676 |
| Mateus Patrício Pereira | 564695 |

---

## Problema Escolhido

As equipes de conservação da Motiva realizam atividades de poda de vegetação nas rodovias de forma frequente, mas o acompanhamento dessas atividades é fragmentado: operadores de campo não têm visibilidade clara das tarefas do dia, supervisores não conseguem acompanhar em tempo real o cumprimento das obrigações regulatórias (ARTESP/ANTT), e não há um canal único para registro e consulta das atividades programadas.

O recorte escolhido: **dar ao operador de campo uma ferramenta mobile que concentre suas atividades de poda do dia e da semana**, reduzindo retrabalho de comunicação e aumentando a rastreabilidade das operações.

---

## Persona

**João Silva — Operador de Campo**

- 34 anos, trabalha na frente de conservação da Motiva há 6 anos
- Acessa informações via smartphone Android durante o expediente
- Precisa saber quais trechos deve podar, em qual horário e quantos dias tem pela frente
- Sofre com informações chegando por WhatsApp, e-mail e planilha sem integração
- Objetivo: chegar na rodovia já sabendo exatamente o que fazer, sem precisar ligar para o supervisor

> Persona completa e requisitos detalhados: [REQUISITOS.md](./REQUISITOS.md)

---

## Proposta de Solução

O **PrognosisHerba** é um app mobile que permite ao operador de campo:

1. **Registrar-se e fazer login** com persistência de sessão (fica logado mesmo ao fechar o app)
2. **Visualizar as atividades do dia** — quais trechos têm poda programada e quais não têm
3. **Consultar a agenda semanal** — quantos dias de poda, locais definidos e horários
4. **Ver um resumo rápido** da semana com dias de poda, número de locais e horário de início
5. **Fazer logout** a qualquer momento com limpeza segura da sessão

---

## Stack Tecnológica e Justificativa

| Tecnologia | Versão | Justificativa |
|---|---|---|
| **React Native** | 0.81.5 | Framework cross-platform amplamente adotado; único codebase para Android e iOS, reduzindo custo de manutenção |
| **Expo SDK** | 54 | Abstrai configurações nativas complexas; acelera o ciclo de desenvolvimento com hot reload e build simplificado |
| **React Navigation** | 7 (native-stack) | Navegação nativa com performance equivalente a uma navegação 100% nativa |
| **AsyncStorage** | 2.2.0 | Persistência local leve e assíncrona; mantém a sessão do usuário entre sessões sem necessidade de backend |
| **Jest + jest-expo** | 29 / 55 | Suite de testes com preset Expo; garante cobertura via TDD — testes escritos antes da implementação |
| **@testing-library/react-native** | 13 | Testes orientados ao comportamento do usuário, não à implementação interna dos componentes |

**Por que React Native + Expo?** O operador de campo usa Android. A Motiva pode precisar estender o app para iOS em supervisores. O Expo permite entregar nas duas plataformas com um único time sem duplicar o código.

---

## Protótipo no Figma

> 🔗 _[(inserir link do protótipo Figma com permissão de visualização ativa)](https://www.figma.com/design/U65XJovakZgKdhKiMNkwNe/PrognosisHerba?node-id=0-1&t=tej6hlv1yH7muMyN-1)_

---

## Estrutura do Projeto

```
PrognosisHerba/
├── __tests__/              # Testes escritos antes da implementação (TDD)
│   ├── RegisterScreen.test.js
│   ├── LoginScreen.test.js
│   ├── DashboardScreen.test.js
│   ├── AuthService.test.js
│   ├── AppNavigation.test.js
│   ├── TrechosService.test.js
│   ├── LocationService.test.js
│   ├── TrechosScreen.test.js
│   └── TrechoDetailScreen.test.js
├── src/
│   ├── screens/
│   │   ├── RegisterScreen.js
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── TrechosScreen.js        # Lista de trechos da rodovia (mock + GPS)
│   │   └── TrechoDetailScreen.js   # Detalhe do trecho + registro de inspeção
│   ├── components/
│   │   └── AppLogo.js
│   ├── services/
│   │   ├── AuthService.js      # Persistência de sessão via AsyncStorage
│   │   ├── TrechosService.js   # Camada de mock de dados (trechos/inspeções)
│   │   └── LocationService.js  # Wrapper de GPS (expo-location)
│   ├── mocks/
│   │   └── trechosMock.js       # Dados mockados de trechos da rodovia
│   ├── constants/
│   │   └── previsaoIA.js        # Níveis de previsão de IA (emoji, cor, prioridade)
│   └── theme/
│       └── colors.js
├── App.js                      # Navegação + verificação de sessão na inicialização
├── REQUISITOS.md               # RF, RNF, persona detalhada e restrições técnicas
└── package.json
```

---

## Como Executar

```bash
# Instalar dependências
npm install

# Rodar no Android
npm run android

# Rodar testes
npm test
```

---

## Fluxo Principal

```
Inicialização
    │
    ├─ Usuário tem sessão salva? ──Sim──▶ Dashboard
    │
    └─ Não ──▶ Tela de Registro ──▶ Tela de Login ──▶ Dashboard
                                                           │
                                                        Logout
                                                           │
                                                    Tela de Registro
```

---

## Sprint 2 — Mock de Dados, GPS e Fluxo Funcional

A Sprint 2 evolui o app de um protótipo de autenticação para um app funcional com dados
mockados, recurso nativo (GPS) e um fluxo completo de interação.

### Mock de dados — `src/mocks/trechosMock.js`

Representa **5 trechos** das rodovias concedidas à Motiva (Anhanguera SP-330, Bandeirantes
SP-348, Castello Branco SP-280, Raposo Tavares SP-270 e Rodoanel SP-021), cada um com:

- `rodovia`, `km` e `nomeTrecho`
- `latitude` / `longitude` (usadas pelo recurso de GPS)
- `statusVegetacao`: `Conforme` 🟢 | `Atenção` 🟡 | `Crítico` 🔴
- `ultimaInspecao` e `historico` de inspeções anteriores (data, status, observação, técnico)
- `previsaoIA`: `{ nivel, confianca, motivo }` — previsão automática da necessidade de poda
  (`Urgente` 🔴 | `Atenção` 🟡 | `Não necessária` 🟢), com % de confiança e justificativa
- `feedbackPodador`: `{ podaRealizada, previsaoCorreta, dataFeedback }` — feedback do
  operador sobre a execução da poda e o acerto da previsão da IA

Esses dados simulam o que viria de uma API real de monitoramento de vegetação por trecho.

### Camada de mock — `src/services/TrechosService.js`

Segue o mesmo padrão do `AuthService`: lê/grava no `AsyncStorage` (chave
`@prognosisherba:trechos`). Na primeira execução, semeia o storage com `trechosMock.js`.
Expõe:

- `getTrechos()` — lista todos os trechos (faz *backfill* de `previsaoIA`/`feedbackPodador`
  em dados persistidos antes dessa feature existir)
- `getTrechoById(id)` — busca um trecho específico
- `registerInspecao(trechoId, { status, observacao, tecnico })` — registra uma nova
  inspeção, atualiza o status de vegetação e o histórico, e persiste a alteração
- `registerFeedback(trechoId, { podaRealizada, previsaoCorreta })` — registra o feedback
  do podador sobre a execução da poda e o acerto da previsão de IA, com data

### Recurso nativo — GPS (`src/services/LocationService.js`)

Usa `expo-location` para obter a localização atual do operador
(`requestForegroundPermissionsAsync` + `getCurrentPositionAsync`). A localização é
combinada com as coordenadas de cada trecho (via cálculo de distância Haversine) para
destacar o **trecho mais próximo do operador** na lista — conectando um recurso nativo do
device diretamente ao mock de dados.

### Novas telas

- **TrechosScreen** — lista os trechos com badge de status de vegetação, data da última
  inspeção e a localização atual do operador; destaca o trecho mais próximo.
- **TrechoDetailScreen** — exibe os detalhes do trecho selecionado, o histórico completo de
  inspeções e um formulário para **registrar uma nova inspeção** (status + observação).

### Previsão de IA e feedback do podador

A `TrechosScreen` exibe um banner "🤖 Previsão de IA — Necessidade de Poda" com a legenda
dos 3 níveis (`src/constants/previsaoIA.js`) e ordena os trechos por prioridade — do mais
urgente para o desnecessário, com desempate pela distância GPS até o operador. Cada card
mostra um selo com o nível e a confiança da previsão (ex.: `🤖 IA: 🔴 Urgente • 94% de
confiança`).

Na `TrechoDetailScreen`, a seção "🤖 Previsão de IA" mostra o nível, a confiança (%) e o
motivo da classificação. Na seção "Feedback da poda", o operador responde se realizou a
poda e se a previsão da IA acertou o nível de urgência; o `TrechosService.registerFeedback`
persiste essa resposta com a data, simulando o ciclo de avaliação do modelo.

### Fluxo funcional demonstrado

```
Dashboard ──▶ "Trechos da Rodovia" ──▶ Lista de Trechos (status + GPS)
                                              │
                                              ▼
                                      Detalhe do Trecho
                                              │
                              Seleciona status + observação
                                              │
                                    "Registrar Inspeção"
                                              │
                          TrechosService atualiza o mock (AsyncStorage)
                                              │
                  Status do trecho e histórico são atualizados na tela
                          e refletidos na lista ao voltar
```

Esse fluxo demonstra a ação do usuário (registrar inspeção) alterando os dados mockados e
a interface refletindo o novo estado em tempo real, sem depender de uma API externa.

### Permissão de localização

O `app.json` inclui o plugin `expo-location` com a descrição de uso da permissão
(`locationWhenInUsePermission`). Ao abrir a tela **Trechos da Rodovia** pela primeira vez em
um dispositivo físico, o app solicitará permissão de localização ao usuário.
