import * as ImagePicker from 'expo-image-picker';

// Anexo de foto na inspeção (Sprint 4 — P8). Segundo recurso nativo do app,
// ao lado do GPS: a câmera do aparelho registra a evidência de campo.
const OPCOES = { mediaTypes: ['images'], quality: 0.5, allowsEditing: false, exif: false };

export class FotoPermissaoError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FotoPermissaoError';
  }
}

function primeiraUri(resultado) {
  if (!resultado || resultado.canceled || !resultado.assets?.length) return null;
  return resultado.assets[0].uri;
}

const FotoService = {
  // Retorna a URI da foto, ou null se o operador cancelar.
  async tirarFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissao.granted) {
      throw new FotoPermissaoError(
        'Permissão da câmera negada. Libere o acesso nas configurações do aparelho para anexar fotos.',
      );
    }
    return primeiraUri(await ImagePicker.launchCameraAsync(OPCOES));
  },

  // O seletor de fotos do Android 13+ dispensa permissão de armazenamento.
  async escolherDaGaleria() {
    return primeiraUri(await ImagePicker.launchImageLibraryAsync(OPCOES));
  },
};

export default FotoService;
