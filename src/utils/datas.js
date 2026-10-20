// Utilitários de data do app (Sprint 4).
//
// Até a Sprint 3 a agenda e os mocks usavam uma data fixa (16/06/2026). Agora
// tudo é calculado a partir do relógio do aparelho. O `Relogio` fica isolado
// num objeto para que os testes consigam "congelar" o dia com jest.spyOn.
//
// Todas as datas são tratadas no fuso local do aparelho. O código antigo usava
// toISOString(), que converte para UTC: depois das 21h no Brasil isso gravava
// a data do dia seguinte.

export const Relogio = {
  agora() {
    return new Date();
  },
};

const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function pad(n) {
  return String(n).padStart(2, '0');
}

// Data local à meia-noite, sem horário — base para comparações por dia.
export function inicioDoDia(data) {
  const d = new Date(data);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function hoje() {
  return inicioDoDia(Relogio.agora());
}

export function addDias(data, dias) {
  const d = inicioDoDia(data);
  d.setDate(d.getDate() + dias);
  return d;
}

// "AAAA-MM-DD" no fuso local.
export function toISODate(data) {
  const d = new Date(data);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

// "AAAA-MM-DD HH:mm" no fuso local.
export function toISODateTime(data) {
  const d = new Date(data);
  return toISODate(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

// Converte "AAAA-MM-DD" em Date local (new Date('AAAA-MM-DD') seria UTC).
export function parseISODate(texto) {
  const [ano, mes, dia] = String(texto).slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

export function diasEntre(inicio, fim) {
  const a = inicioDoDia(typeof inicio === 'string' ? parseISODate(inicio) : inicio);
  const b = inicioDoDia(typeof fim === 'string' ? parseISODate(fim) : fim);
  return Math.round((b - a) / 86400000);
}

export function nomeDiaSemana(data) {
  return DIAS_SEMANA[new Date(data).getDay()];
}

// "16 de junho"
export function formatarDiaMes(data) {
  const d = new Date(data);
  return d.getDate() + ' de ' + MESES[d.getMonth()];
}

// "Terça-feira, 16 de junho"
export function formatarDiaExtenso(data) {
  return nomeDiaSemana(data) + ', ' + formatarDiaMes(data);
}

// "16/06/2026"
export function formatarDataCurta(data) {
  const d = typeof data === 'string' ? parseISODate(data) : new Date(data);
  return pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear();
}

export function ehFimDeSemana(data) {
  const dia = new Date(data).getDay();
  return dia === 0 || dia === 6;
}

// Dia de trabalho que o app considera "hoje": o próprio dia em dias úteis, ou
// a segunda-feira seguinte quando o app é aberto no fim de semana.
export function getDiaOperacional(base = hoje()) {
  const dia = inicioDoDia(base);
  const semana = dia.getDay();
  if (semana === 6) return addDias(dia, 2);
  if (semana === 0) return addDias(dia, 1);
  return dia;
}

// Segunda a sexta da semana do dia operacional.
export function getSemanaOperacional(base = hoje()) {
  const operacional = getDiaOperacional(base);
  const segunda = addDias(operacional, 1 - operacional.getDay());
  return [0, 1, 2, 3, 4].map((i) => addDias(segunda, i));
}

// "15 a 19 de junho" ou "29 de setembro a 3 de outubro".
export function formatarIntervalo(inicio, fim) {
  const a = new Date(inicio);
  const b = new Date(fim);
  if (a.getMonth() === b.getMonth()) {
    return a.getDate() + ' a ' + formatarDiaMes(b);
  }
  return formatarDiaMes(a) + ' a ' + formatarDiaMes(b);
}

// Estação chuvosa no Sudeste: outubro a março. Usada pelo motor de previsão,
// porque a vegetação da faixa de domínio cresce bem mais rápido nesse período.
export function ehPeriodoChuvoso(data) {
  const mes = new Date(data).getMonth();
  return mes >= 9 || mes <= 2;
}
