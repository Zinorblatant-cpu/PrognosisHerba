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
│   └── AppNavigation.test.js
├── src/
│   ├── screens/
│   │   ├── RegisterScreen.js
│   │   ├── LoginScreen.js
│   │   └── DashboardScreen.js
│   ├── components/
│   │   └── AppLogo.js
│   ├── services/
│   │   └── AuthService.js      # Persistência de sessão via AsyncStorage
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
