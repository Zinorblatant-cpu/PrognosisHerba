# PrognosisHerba 🌿

Aplicativo mobile desenvolvido para o **Challenge CCR Motiva — Sprint 1**, com foco no monitoramento, planejamento e gestão de vegetação em rodovias concedidas.

---

# 📖 Sobre o Projeto

O **PrognosisHerba** foi criado para auxiliar operadores de campo, supervisores e gestores responsáveis pela conservação de rodovias da Motiva.

A solução busca otimizar o processo de monitoramento e planejamento de podas e manutenção da vegetação, ajudando equipes operacionais a registrarem atividades de campo, acompanharem cronogramas e organizarem intervenções com mais eficiência.

O projeto foi desenvolvido considerando o contexto operacional apresentado pela CCR Motiva, incluindo:
- Conservação de rodovias;
- Gestão de equipes de poda;
- Necessidades operacionais de campo;
- Controle de atividades semanais;
- Organização de informações operacionais.

---

# 🎯 Problema Escolhido

Atualmente, equipes responsáveis pela conservação vegetal em rodovias enfrentam dificuldades relacionadas a:
- Organização manual das atividades;
- Falta de centralização das informações;
- Dificuldade no acompanhamento das podas programadas;
- Comunicação operacional pouco eficiente;
- Necessidade de maior controle das atividades executadas em campo.

---

# 💡 Proposta da Solução

O **PrognosisHerba** propõe uma solução mobile para:
- Planejar atividades de poda;
- Visualizar tarefas diárias e semanais;
- Organizar cronogramas operacionais;
- Facilitar o acompanhamento das equipes;
- Centralizar informações operacionais em um único sistema.

A aplicação possui um fluxo simples e intuitivo para facilitar o uso em campo.

---

# 👤 Persona Principal

## Nome:
Carlos Henrique

## Idade:
38 anos

## Cargo:
Supervisor de Conservação Rodoviária

## Objetivos:
- Organizar equipes de poda;
- Monitorar atividades programadas;
- Melhorar o controle operacional;
- Garantir maior eficiência na conservação das rodovias.

## Dores:
- Falta de padronização dos registros;
- Controle operacional descentralizado;
- Dificuldade de acompanhamento em tempo real;
- Alto volume de atividades manuais.

---

# 🛠️ Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React Native | 0.81.5 | Desenvolvimento mobile cross-platform |
| Expo | ~54.0.33 | Ambiente de desenvolvimento e build |
| React Navigation | ^7 | Navegação entre telas |
| AsyncStorage | 2.2.0 | Persistência local de sessão |
| Jest | ^29 | Testes automatizados |
| jest-expo | ^55 | Integração de testes com Expo |
| Testing Library | ^13 | Testes de componentes |

---

# ✅ Justificativa da Stack

### React Native
Permite desenvolvimento multiplataforma com alta produtividade e reutilização de código.

### Expo
Facilita configuração, testes e execução do projeto durante o desenvolvimento acadêmico.

### React Navigation
Estrutura a navegação entre telas de forma organizada e escalável.

### AsyncStorage
Permite persistência local de sessão sem necessidade de backend nesta Sprint.

### Jest + Testing Library
Garantem qualidade, previsibilidade e cobertura de testes utilizando abordagem TDD.

---

# 📱 Fluxo da Aplicação

```txt
Usuário não autenticado
    ↓
Tela de Cadastro
    ↓
Tela de Login
    ↓
Dashboard Principal
    ↓
Visualização das atividades
    ↓
Logout
```

---

# 🖥️ Telas Implementadas

## RegisterScreen
Tela responsável pelo cadastro de usuários.

### Funcionalidades:
- Cadastro com email e senha;
- Validação de email;
- Confirmação de senha;
- Navegação para login.

---

## LoginScreen
Tela responsável pela autenticação do usuário.

### Funcionalidades:
- Login com email e senha;
- Persistência de sessão;
- Navegação automática para dashboard.

---

## DashboardScreen
Tela principal do sistema.

### Funcionalidades:
- Visualização das atividades do dia;
- Visualização do cronograma semanal;
- Resumo operacional;
- Logout da aplicação.

---

# 📂 Estrutura do Projeto

```txt
PrognosisHerba/
├── App.js
├── index.js
├── app.json
├── assets/
├── src/
│   ├── components/
│   ├── screens/
│   ├── services/
│   └── theme/
└── __tests__/
```

---

# 🧪 Testes

O projeto utiliza abordagem **TDD (Test Driven Development)**.

## Cobertura atual:
- Navegação;
- Login;
- Cadastro;
- Dashboard;
- Persistência de sessão.

## Total:
✅ 41 testes passando.

---

# 🔒 Requisitos Funcionais (RF)

| Código | Requisito |
|---|---|
| RF01 | O usuário deve conseguir realizar cadastro |
| RF02 | O usuário deve conseguir realizar login |
| RF03 | O sistema deve validar email |
| RF04 | O sistema deve validar confirmação de senha |
| RF05 | O sistema deve persistir sessão |
| RF06 | O usuário deve visualizar atividades diárias |
| RF07 | O usuário deve visualizar cronograma semanal |
| RF08 | O usuário deve conseguir realizar logout |

---

# ⚙️ Requisitos Não Funcionais (RNF)

| Código | Requisito |
|---|---|
| RNF01 | O app deve funcionar em Android e iOS |
| RNF02 | O sistema deve possuir interface responsiva |
| RNF03 | O sistema deve possuir navegação intuitiva |
| RNF04 | O sistema deve manter persistência local de sessão |
| RNF05 | O código deve possuir testes automatizados |
| RNF06 | O sistema deve possuir identidade visual consistente |

---

# 🎨 Identidade Visual

O projeto utiliza uma identidade visual dark com verde neon inspirado em:
- Tecnologia;
- Natureza;
- Monitoramento ambiental.

## Paleta de cores

| Elemento | Cor |
|---|---|
| Fundo | `#111111` |
| Cards | `#1C1C1C` |
| Verde Primário | `#AAFF00` |
| Texto | `#FFFFFF` |
| Erro | `#FF4444` |

---

# 🚀 Como Rodar o Projeto

## Instalar dependências

```bash
npm install
```

## Iniciar projeto

```bash
npm start
```

## Android

```bash
npm run android
```

## iOS

```bash
npm run ios
```

---

# 🧪 Rodar Testes

```bash
npm test
```

---

# 🔗 Protótipo Figma

Adicionar link do Figma aqui:

```txt
https://www.figma.com/design/U65XJovakZgKdhKiMNkwNe/PrognosisHerba?node-id=0-1&t=kPh46l4wXuSrPu0r-0
```

---

# 👥 Integrantes

| Nome | RM |
|---|---|
| Leonardo Lopes Oliveira | RM565437 |
| Lucas Ferrari Lima | RM563119 |
| Carlos Eduardo Pires Cervelli | RM563462 |
| Felipe Krzyzanovski dos Santos Menezes | RM564878 |
| Arthur de Souza Matos Dias | RM566068 |
| Guilherme Carreri Giampietro | RM565676 |
| Mateus Patrício Pereira | RM564695 |

---

# 📌 Status do Projeto

✅ Sprint 1 concluída  
🚧 Preparado para evolução na Sprint 2
