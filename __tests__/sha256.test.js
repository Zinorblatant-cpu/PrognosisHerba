import { sha256, hashSenha, gerarSalt } from '../src/utils/sha256';

describe('sha256', () => {
  it('confere com os vetores de teste do NIST (FIPS 180-2)', () => {
    expect(sha256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    expect(sha256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
    expect(sha256('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')).toBe(
      '248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1'
    );
  });

  it('trata acentos como UTF-8', () => {
    // Valor de referência gerado com crypto.createHash('sha256') do Node.
    expect(sha256('ç')).toBe('8bfa829b8119a6f39b91fd8decec63830b556e4d88a9da29334d7b0558829f2d');
    expect(sha256('ação')).not.toBe(sha256('acao'));
  });

  it('hashSenha depende do salt e é determinístico', () => {
    const salt = gerarSalt();
    expect(salt).toHaveLength(32);
    expect(hashSenha('senha123', salt)).toBe(hashSenha('senha123', salt));
    expect(hashSenha('senha123', salt)).not.toBe(hashSenha('senha123', gerarSalt()));
    expect(hashSenha('senha123', salt)).not.toContain('senha123');
  });
});
