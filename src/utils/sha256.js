// SHA-256 em JavaScript puro (Sprint 4 — P1).
//
// Usado para que a senha nunca seja gravada em texto no aparelho. Implementação
// própria para não adicionar módulo nativo só por causa disso; validada contra
// os vetores de teste oficiais do NIST em __tests__/sha256.test.js.

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
  0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
  0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
  0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
  0xc67178f2,
];

function utf8Bytes(texto) {
  const bytes = [];
  for (let i = 0; i < texto.length; i++) {
    let c = texto.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < texto.length) {
      const baixo = texto.charCodeAt(i + 1);
      if (baixo >= 0xdc00 && baixo <= 0xdfff) {
        c = 0x10000 + ((c - 0xd800) << 10) + (baixo - 0xdc00);
        i++;
      }
    }
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }
  return bytes;
}

const rotr = (x, n) => (x >>> n) | (x << (32 - n));

export function sha256(texto) {
  const bytes = utf8Bytes(String(texto));
  const bits = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  // Tamanho em bits como inteiro de 64 bits big-endian.
  const alto = Math.floor(bits / 0x100000000);
  const baixo = bits >>> 0;
  bytes.push((alto >>> 24) & 255, (alto >>> 16) & 255, (alto >>> 8) & 255, alto & 255);
  bytes.push((baixo >>> 24) & 255, (baixo >>> 16) & 255, (baixo >>> 8) & 255, baixo & 255);

  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const W = new Array(64);

  for (let bloco = 0; bloco < bytes.length; bloco += 64) {
    for (let t = 0; t < 16; t++) {
      const j = bloco + t * 4;
      W[t] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(W[t - 15], 7) ^ rotr(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rotr(W[t - 2], 17) ^ rotr(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  return H.map((x) => x.toString(16).padStart(8, '0')).join('');
}

// Salt aleatório por conta: duas contas com a mesma senha geram hashes diferentes.
export function gerarSalt(tamanho = 16) {
  const caracteres = '0123456789abcdef';
  let salt = '';
  for (let i = 0; i < tamanho * 2; i++) salt += caracteres[Math.floor(Math.random() * 16)];
  return salt;
}

// Hash iterado (estiramento de chave) para encarecer ataque de força bruta
// caso alguém extraia o storage do aparelho.
export const ITERACOES_HASH = 1000;

export function hashSenha(senha, salt, iteracoes = ITERACOES_HASH) {
  let hash = sha256(salt + ':' + senha);
  for (let i = 1; i < iteracoes; i++) hash = sha256(salt + hash);
  return hash;
}
