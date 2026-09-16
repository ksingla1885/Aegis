/**
 * Seeded pseudo-random number generator (Mulberry32)
 */
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Converts string to 32-bit integer seed
 */
function stringToSeed(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

/**
 * Deterministically shuffles an array based on a candidate seed string
 */
export function shuffleArrayWithSeed(array, seedString) {
  const seed = stringToSeed(seedString || "AEGIS_DEFAULT_SEED");
  const random = mulberry32(seed);
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * Dynamic Security Hash for candidate identification watermark
 */
export function generateCandidateHash(name, rollNo, testId) {
  const raw = `${name}_${rollNo}_${testId}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `AEGIS-${Math.abs(hash).toString(16).toUpperCase().padStart(8, '0')}`;
}

/**
 * Simple Base64 + XOR obfuscated encryption for local draft backup
 */
export function encryptDraftPayload(payload, secretKey = "AEGIS_LOCAL_KEY") {
  try {
    const str = JSON.stringify(payload);
    let output = "";
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      output += String.fromCharCode(charCode);
    }
    return btoa(output);
  } catch (e) {
    console.error("Encryption error:", e);
    return null;
  }
}

/**
 * Decrypts obfuscated draft payload from LocalStorage
 */
export function decryptDraftPayload(cipherText, secretKey = "AEGIS_LOCAL_KEY") {
  try {
    const raw = atob(cipherText);
    let output = "";
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ secretKey.charCodeAt(i % secretKey.length);
      output += String.fromCharCode(charCode);
    }
    return JSON.parse(output);
  } catch (e) {
    console.error("Decryption error:", e);
    return null;
  }
}
