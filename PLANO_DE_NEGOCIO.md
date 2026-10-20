# 📈 Plano de Negócio — PrognosisHerba

**Challenge CCR Motiva · Sprint 4**
Documento curto e com as contas abertas: todo número que não vem de fonte pública está
marcado como **estimativa** e traz a premissa usada, para que a banca (ou a Motiva) possa
trocar a premissa e refazer a conta.

---

## 1. O problema, no contexto da Motiva

A Motiva administra **13 concessões rodoviárias, com cerca de 5 mil km**, em SP, RJ, MS, RS, SC
e PR [1]. Em todas elas a conservação da faixa de domínio — roçada, capina e poda — é
**obrigação contratual** prevista no PER de cada concessão [3].

O problema não é "cortar mato", é **decidir onde e quando cortar**:

- **O crescimento é sazonal e desigual.** Em janeiro de 2026 a ANTT enviou ofício às
  concessionárias federais apontando crescimento excessivo de vegetação no período chuvoso —
  em base de barreiras, taludes e canteiros — com reclamações de usuários e da imprensa sobre
  **visibilidade da sinalização, drenagem e segurança**, e recomendou monitoramento permanente
  e intensificação preventiva da roçada [2].
- **Calendário fixo gasta errado.** Um cronograma igual para todos os trechos roça cedo demais
  onde a vegetação cresce pouco (período seco) e tarde demais onde ela cobre placas.
- **A informação de campo se perde.** O podador vê a situação real do trecho, mas o registro
  é manual, sem foto, sem georreferência e sem retorno para quem planeja.

### O que a Motiva já faz — e onde entramos

A própria Motiva já testa **imagens de satélite com IA** no Rodoanel para classificar a
vegetação, estimar altura e gerar ordens de trabalho, com plano de levar o modelo às demais
concessões [4]. Na Autoban, colocou em operação um **robô de roçada** de 8 mil m²/dia [5].

Ou seja: a Motiva já resolve o "ver de cima" e o "cortar". **O PrognosisHerba cobre a camada
que falta entre os dois — o campo:** quem confirma a execução, registra a evidência e diz se a
previsão acertou. Não competimos com o modelo de satélite; nós damos a ele o
**dado de verdade de campo** (*ground truth*) que nenhum satélite coleta sozinho.

---

## 2. Proposta de valor

> **Roçar o trecho certo, na hora certa, com prova de que foi feito.**

| Para quem | Ganho |
|---|---|
| **Gestão de conservação** | Prioriza a roçada pela necessidade prevista do trecho, e não pelo calendário — menos ciclos desnecessários no seco, resposta mais rápida no chuvoso |
| **Supervisor de equipe** | Escala da semana, confirmação/ausência do dia e situação de cada trecho num só lugar |
| **Podador (operador de campo)** | App simples: abre o trecho mais próximo pelo GPS, fotografa, registra e segue |
| **Regulatório / fiscalização** | Histórico georreferenciado com foto e data por trecho, pronto para responder à ANTT/ARTESP |
| **Segurança viária** | Trechos com vegetação sobre placas ou curvas sobem automaticamente para "Urgente" |

**O que já está no APK (Sprint 4):** previsão por trecho com justificativa visível (fatores e
pontos), feedback do podador e **tela de taxa de acerto do modelo**, foto da inspeção pela
câmera, GPS com trecho mais próximo, abertura do trecho no app de mapas, agenda real da semana e
registro de poda/ausência.

---

## 3. Público-alvo e personas

**Cliente pagante (B2B):** concessionárias de rodovias. **Cliente-âncora: Motiva Rodovias.**
**Piloto proposto: Motiva Autoban** — sistema Anhanguera-Bandeirantes, **319,8 km** [6], onde já
estão os trechos simulados no app e o robô de roçada [5].

| Persona | Papel na compra | Dor principal | O que usa |
|---|---|---|---|
| **Fernanda Rocha, 44** — Gerente de Conservação da concessionária | **Decide e paga** | Orçamento de roçada estourando no período chuvoso e cobrança da agência reguladora | Painel de prioridade e desempenho da IA |
| **Carlos Henrique, 38** — Supervisor de Conservação Rodoviária | Influencia; usuário diário | Controle descentralizado, registros sem padrão, não sabe em tempo real o que foi feito | Agenda, notificações, histórico dos trechos |
| **João Silva, 31** — Operador de conservação vegetal (podador) | Usuário de campo | Papelada, deslocamento para trecho errado, ninguém ouve o que ele vê | App: trechos, inspeção com foto, confirmar poda |

---

## 4. Modelo de receita

**SaaS com licença por quilômetro monitorado**, mais piloto pago e serviços opcionais.

| Item | Preço | Observação |
|---|---|---|
| **Piloto (POC) — 1 concessão, 5 meses** | **R$ 60 mil** (valor fixo) | Formato do Programa de Inovação Aberta da Motiva, que trabalha com POC/MVP em ambiente real e modelo *venture client* [7] |
| **Licença SaaS** | **R$ 45 / km / mês** | Usuários ilimitados, app Android, painel web, motor de previsão, suporte em horário comercial |
| **Serviço gerenciado (opcional)** | R$ 180/h ou pacote | Integração com ERP/ordens de serviço, integração com o modelo de satélite da Motiva, treinamento de equipes |

**Por que por km e não por usuário:** cobrar por usuário desestimula colocar todos os
podadores no app — e é justamente o feedback deles que melhora o modelo. O km acompanha o
tamanho do contrato de concessão, que é como a concessionária já pensa custo.

| Cenário de receita (estimativa) | km | Receita anual |
|---|---|---|
| Piloto Autoban | 319,8 | R$ 60 mil (POC) |
| Autoban em licença | 319,8 | **R$ 172,7 mil** |
| Todas as concessões da Motiva | ~5.000 | **R$ 2,7 milhões** |

---

## 5. Por que a Motiva pagaria: ordem de grandeza do custo de roçada

Premissas (**estimativa**, todas ajustáveis):

- Faixa roçada média de **25 m por km** de rodovia (≈ 10 m em cada margem + 5 m de canteiro) → **2,5 ha/km**
- **6 ciclos de roçada por ano** (mais no chuvoso, menos no seco)
- Custo direto SICRO/DNIT, São Paulo, abr/2026: roçada **mecanizada R$ 1.005,01/ha** [8] e
  **manual R$ 2.631,55/ha** [9]; mistura de **60% mecanizada / 40% manual** → **R$ 1.656/ha**
  (sem BDI)

| | Autoban (319,8 km) | Motiva (~5.000 km) |
|---|---|---|
| Área roçada por ano | ~4.800 ha | ~75.000 ha |
| **Custo direto anual de roçada** | **~R$ 7,9 milhões** | **~R$ 124 milhões** |
| Economia se 3% dos ciclos forem evitados/realocados | R$ 238 mil | R$ 3,7 milhões |
| Economia se 5% dos ciclos forem evitados/realocados | R$ 397 mil | R$ 6,2 milhões |
| Custo da licença PrognosisHerba | R$ 172,7 mil | R$ 2,7 milhões |
| **Retorno (economia ÷ licença)** | **1,4x a 2,3x** | **1,4x a 2,3x** |

Leitura honesta: **com 3% de eficiência a conta já fecha; abaixo disso, não.** Por isso o
piloto tem como meta principal medir esse número (seção 8). E a conta acima ignora ganhos
difíceis de precificar — menos exposição dos trabalhadores ao tráfego, menos reclamações e
autuações, evidência para a fiscalização — que só reforçam o caso.

---

## 6. Custos operacionais (estimativa, escala Motiva completa)

| Item | Custo mensal | Premissa |
|---|---|---|
| Equipe: 2 devs, 1 cientista de dados, 1 PO, 1 suporte/CS | R$ 83 mil | Salários de mercado × 1,8 de encargos (CLT) |
| Nuvem (API, banco gerenciado, armazenamento de fotos) | R$ 8 mil | ~500 podadores × 10 fotos/dia × 300 KB ≈ 45 GB/mês de fotos |
| Build/distribuição do app e ferramentas | R$ 2 mil | Expo EAS, contas de loja, monitoramento de erros |
| Imagens de satélite | R$ 0 | Sentinel-2 (Copernicus) é gratuito; imagens comerciais só se o cliente pedir |
| Jurídico, contabilidade, administrativo | R$ 7 mil | Terceirizado |
| **Total** | **~R$ 100 mil/mês (R$ 1,2 mi/ano)** | |

**Ponto de equilíbrio:** R$ 100 mil ÷ R$ 45/km ≈ **2.200 km sob licença** — menos da metade da
malha da Motiva. Até lá, a operação depende do piloto pago e de uma equipe menor (no piloto,
2 devs + 1 cientista de dados em tempo parcial).

---

## 7. Diferenciais frente ao problema da Motiva

1. **Camada de campo, complementar ao satélite.** O modelo de satélite do Rodoanel vê a
   vegetação; o PrognosisHerba registra a execução e mede se a previsão acertou. Juntos fecham o
   ciclo *prever → executar → validar → re-treinar*.
2. **Previsão explicável.** Cada nota (0–100) mostra os fatores que a compõem — status, dias sem
   inspeção, período chuvoso, risco à sinalização. O supervisor entende e contesta; não é caixa-preta.
3. **Feedback do podador como dado de treino.** A tela "Desempenho da IA" já consolida a taxa de
   acerto por nível e por trecho — é o *dataset* do modelo de machine learning da próxima versão.
4. **Evidência para a fiscalização.** Foto, data, técnico e localização em cada inspeção.
5. **Feito para o campo.** Alto contraste para uso no sol, poucos toques, funciona sem rede
   (dados locais) e roda em Android de entrada.

---

## 8. Plano de entrada e metas do piloto

| Fase | Prazo | Entrega |
|---|---|---|
| **0 — MVP (concluído)** | Sprint 4 | APK com todos os fluxos, motor de previsão heurístico, 233 testes automatizados |
| **1 — Piloto Autoban** | 5 meses | Backend, login corporativo, fila offline, integração com a escala real das equipes |
| **2 — Concessões de SP** | +6 meses | Modelo de ML treinado com o feedback do piloto; integração com o satélite |
| **3 — Malha Motiva completa** | +12 meses | 13 concessões; abertura para outras concessionárias |

**Metas do piloto (critério de sucesso):**

- ≥ **80%** de acerto da previsão, medido pelo feedback dos podadores
- ≥ **3%** dos ciclos de roçada evitados ou realocados sem queda de conformidade
- Trechos "Urgente" com risco à sinalização atendidos em **≤ 48 h**
- ≥ **90%** das diárias confirmadas pelo app (adoção real em campo)

---

## 9. Principais riscos

| Risco | Prob. | Impacto | Mitigação |
|---|---|---|---|
| **Sobreposição com a IA de satélite que a Motiva já implanta** | Alta | Alto | Posicionar como camada de campo e integrar ao modelo deles via API; o feedback de campo aumenta o valor do satélite em vez de competir |
| Motor de previsão atual é heurístico e **ainda não validado com dados reais** | Alta | Alto | Piloto mede acurácia desde o dia 1; substituir pelo modelo treinado na Fase 2 |
| Baixa adesão dos podadores (luva, sol, pouca familiaridade digital) | Média | Alto | UI de alto contraste e botões grandes; confirmação do dia em 2 toques; treinamento no canteiro |
| Conectividade ruim na faixa de domínio | Alta | Médio | Offline-first: registro local + fila de sincronização (Fase 1) |
| Economia real < 3% (licença não se paga) | Média | Alto | Piloto com meta explícita; preço revisado com base no número medido |
| LGPD — geolocalização de funcionários | Média | Médio | GPS só durante a jornada e só ao abrir a lista de trechos; finalidade informada na permissão; dados mínimos |
| Dependência de um único cliente | Alta | Médio | Após a Fase 2, oferecer a outras concessionárias de rodovias |

---

## 10. Impacto esperado para a Motiva e para as rodovias

- **Segurança viária:** placas e curvas desobstruídas antes de virar reclamação — exatamente o
  ponto levantado pela ANTT no período chuvoso [2].
- **Custo:** de R$ 3,7 a R$ 6,2 milhões/ano em roçada melhor alocada na malha completa
  (estimativa da seção 5).
- **Conformidade:** histórico georreferenciado com foto por trecho para responder a fiscalizações.
- **Pessoas:** menos deslocamentos para trechos que não precisavam de poda = menos tempo de
  exposição do trabalhador à pista.
- **Dados:** um conjunto rotulado por quem está no campo, que melhora qualquer modelo — inclusive
  o de satélite da própria Motiva.

---

## Fontes

1. Santander — Relatório sobre a Motiva (01/07/2026): <https://cms.santander.com.br/sites/WPS/documentos/arq-motiva/26-07-07_203454_20260701-motiva.pdf>
2. ANTT — Ofício Circular SEI nº 260/2026/SUROD/DIR-ANTT (24/01/2026): <https://www.gov.br/antt/pt-br/assuntos/rodovias/normativos-surod/oficios-circulares-orientativos/oficio-circular-no-260-2026-surod-dir-antt.pdf>
3. ANTT — Ofício Circular SEI nº 1186/2025/SUROD/DIR-ANTT (09/04/2025): <https://www.gov.br/antt/pt-br/assuntos/rodovias/normativos-surod/oficios-circulares-orientativos/oficio-circular-no-1186-2025-surod-dir-antt.pdf>
4. Motiva RodoAnel — "RodoAnel utiliza inteligência artificial para elevar padrão de manutenção" (dez/2025): <https://rodovias.motiva.com.br/rodoanel/noticias/2025/dezembro/rodoanel-utiliza-inteligencia-artificial-para-elevar-padrao-de-m/>
5. Motiva Autoban — robô de roçada (ago/2026): <https://rodovias.motiva.com.br/autoban/noticias/2026/agosto/motiva-autoban-investe-em-tecnologia-e-incorpora-robo-para-execu/>
6. Motiva Autoban — Sobre (extensão de 319,8 km): <https://rodovias.motiva.com.br/autoban/sobre/>
7. Motiva — Programa de Inovação Aberta (mar/2026): <https://rodovias.motiva.com.br/rodoanel/noticias/2026/marco/motiva-lanca-programa-de-inovacao-aberta-para-acelerar-investime/>
8. SICRO 4915775 — Roçada mecanizada, SP, base 04/2026: <https://orcamentor.com/sicro/composicoes/4915775/>
9. SICRO 4915740 — Roçada manual, SP, base 04/2026: <https://orcamentor.com/sicro/composicoes/4915740/>
