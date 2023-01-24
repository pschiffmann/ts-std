/**
 * Encodes `bytes` using
 * [base64url](https://www.rfc-editor.org/rfc/rfc4648#section-5) encoding,
 * without padding.
 */
export function encode(bytes: Uint8Array): string {
  const triplets = Math.trunc(bytes.length / 3);
  const dangling = bytes.length % 3;
  const output = new Uint8Array(
    triplets * 4 + (dangling === 0 ? 0 : dangling + 1)
  );

  for (let i = 0, o = 0; i < bytes.length; i += 3, o += 4) {
    // `bytes[i + n]` can exceed `bytes.length`. This is fine because these
    // reads return `undefined`, which gets converted to `0` by the math
    // operators.
    const triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];

    // `output[o + n]` can exceed `output.length`. This is fine because
    // `Uint8Array` is fixed size and ignores out-of-bounds writes.
    output[o] = encodeByte((triplet >>> 18) & mask6);
    output[o + 1] = encodeByte((triplet >>> 12) & mask6);
    output[o + 2] = encodeByte((triplet >>> 6) & mask6);
    output[o + 3] = encodeByte(triplet & mask6);
  }

  return new TextDecoder().decode(output);
}

/**
 * Decodes `base64` to bytes using
 * [base64url](https://www.rfc-editor.org/rfc/rfc4648#section-5) encoding.
 *
 * Throws an error if `base64` contains any non-base64url characters or padding.
 */
export function decode(base64: string): Uint8Array {
  const quadruples = Math.trunc(base64.length / 4);
  const dangling = base64.length % 4;
  if (dangling === 1) {
    throw new Error(
      "Invalid input length: `base64` can't contain a base64url encoded string."
    );
  }
  const output = new Uint8Array(
    quadruples * 3 + (dangling === 3 ? 2 : dangling === 2 ? 1 : 0)
  );

  for (let i = 0, o = 0; i < base64.length; i += 4, o += 3) {
    // `base64.charCodeAt(i + n)` can exceed `base64.length`. This is fine
    // because `decodeByte(NaN)` returns `0`.
    const quadruple =
      (decodeByte(base64.charCodeAt(i + 0)) << 18) |
      (decodeByte(base64.charCodeAt(i + 1)) << 12) |
      (decodeByte(base64.charCodeAt(i + 2)) << 6) |
      decodeByte(base64.charCodeAt(i + 3));
    output[o + 0] = quadruple >>> 16;
    output[o + 1] = quadruple >>> 8;
    output[o + 2] = quadruple;
  }

  return output;
}

/**
 * `alphabet` must contain exactly 64 unique ASCII characters.
 *
 * Returns a function `encodeByte()` that maps the values 0..63 to `alphabet`
 * characters; and a function `decodeByte()` that maps `alphabet` characters
 * back to 0..63, maps `NaN` to `0`, and throws an error on all other
 * characters.
 */
function createTables(alphabet: string) {
  const encodingTable = new Uint8Array(64);
  let maxCharCode = 0;
  for (let i = 0; i < 64; i++) {
    const charCode = alphabet.charCodeAt(i);
    maxCharCode = Math.max(maxCharCode, charCode);
    encodingTable[i] = charCode;
  }

  const decodingTable = new Int8Array(maxCharCode + 1).fill(-1);
  for (let i = 0; i < 64; i++) {
    const charCode = encodingTable[i];
    decodingTable[charCode] = i;
  }

  function encodeByte(byte: number) {
    return encodingTable[byte];
  }

  function decodeByte(byte: number) {
    if (Number.isNaN(byte)) return 0;
    const result = decodingTable[byte];
    if (result === undefined || result === -1) {
      const char = String.fromCharCode(byte);
      throw new Error(
        `Invalid input: "${char}" is not part of the base64url alphabet.`
      );
    }
    return result;
  }

  return [encodeByte, decodeByte];
}

const [encodeByte, decodeByte] = createTables(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
);

const mask6 = 0b111111;
