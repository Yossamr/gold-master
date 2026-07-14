import argon2 from 'argon2-browser/dist/argon2-bundled.min.js';

// Using a static salt or generating random per user?
// The standard is a random salt included in the hash. 
// argon2-browser returns encoded string which includes salt and parameters.
export async function hashPin(pin: string): Promise<string> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const result = await argon2.hash({
    pass: pin,
    salt,
    time: 1,
    mem: 1024,
    hashLen: 32,
    parallelism: 1,
    type: argon2.ArgonType.Argon2id
  });
  return result.encoded;
}

export async function verifyPin(pin: string, encodedHash: string): Promise<boolean> {
  try {
    // If the hash is a plain 4-digit PIN (legacy), upgrade or handle it?
    // The prompt says "store hashed". For backward compatibility, if it doesn't start with $argon2, we could just check equality (and maybe we should upgrade it, but checking is enough).
    if (!encodedHash.startsWith('$argon2')) {
      return pin === encodedHash;
    }
    await argon2.verify({
      pass: pin,
      encoded: encodedHash
    });
    return true;
  } catch (e) {
    return false;
  }
}
