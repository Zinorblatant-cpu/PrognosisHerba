// Configuração de build (Sprint 4 — P10).
//
// O "Modo de demonstração" (cenários de erro, lista vazia e resposta lenta)
// é ferramenta de desenvolvimento e de banca — não deve aparecer para o
// operador na versão instalada. Regra:
//   • build de desenvolvimento (Expo Go / __DEV__) → visível
//   • APK (build de release)                        → oculto; liberado tocando
//     5 vezes na versão do app, na tela de Perfil
//   • EXPO_PUBLIC_MODO_DEMO=true no eas.json       → visível desde o início
import appJson from '../../app.json';

export const VERSAO_APP = appJson.expo.version;
export const NOME_VERSAO = 'Sprint 4 — versão final';

export const MODO_DEMO_PADRAO =
  (typeof __DEV__ !== 'undefined' && __DEV__) || process.env.EXPO_PUBLIC_MODO_DEMO === 'true';

export const TOQUES_PARA_LIBERAR_DEMO = 5;
