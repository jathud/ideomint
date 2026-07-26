// ============================================================
// QR Security — Encrypted & Signed Ticket Tokens
// ============================================================
import crypto from 'crypto';

const RAW_ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || 'ideofest_default_qr_encryption_secret_2026';
const QR_HMAC_SECRET = process.env.QR_HMAC_SECRET || 'ideofest_default_qr_hmac_secret_2026';
const QR_VALIDITY_DAYS = 365; // QR codes valid for 1 year from issue

function get32ByteKey(raw: string): Buffer {
  if (raw && raw.length === 64 && /^[0-9a-fA-F]+$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  return crypto.createHash('sha256').update(raw || RAW_ENCRYPTION_KEY).digest();
}

// ── Encryption ────────────────────────────────────────────────

function encryptAES(text: string, keyHex?: string): string {
  const key = get32ByteKey(keyHex || RAW_ENCRYPTION_KEY);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptAES(encryptedHex: string, keyHex?: string): string {
  const [ivHex, dataHex] = encryptedHex.split(':');
  const key = get32ByteKey(keyHex || RAW_ENCRYPTION_KEY);
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataHex, 'hex')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}

// ── HMAC ─────────────────────────────────────────────────────

function hmacSign(data: string): string {
  return crypto.createHmac('sha256', QR_HMAC_SECRET).update(data).digest('hex');
}

// ── Public API ────────────────────────────────────────────────

export interface QRTokenPayload {
  ref: string;   // ticket_number (IDF-TKT-XXXXXXXX)
  evt: string;   // event slug
  exp: number;   // expiry Unix timestamp
}

/**
 * Generate an encrypted + HMAC-signed QR token.
 * The token is safe to embed in a QR code — contains no PII or DB IDs.
 */
export function generateSecureQRToken(
  ticketNumber: string,
  eventSlug: string,
  expiresAt?: Date
): string {
  const exp = expiresAt
    ? Math.floor(expiresAt.getTime() / 1000)
    : Math.floor(Date.now() / 1000) + QR_VALIDITY_DAYS * 86400;

  const payload: QRTokenPayload = { ref: ticketNumber, evt: eventSlug, exp };
  const payloadJson = JSON.stringify(payload);
  const encrypted = encryptAES(payloadJson, RAW_ENCRYPTION_KEY);
  const sig = hmacSign(encrypted);
  return `${encrypted}.${sig}`;
}

export interface QRValidationResult {
  valid: boolean;
  error?: string;
  payload?: QRTokenPayload;
}

/**
 * Validate an encrypted + signed QR token.
 * Returns the payload if valid, or an error string.
 */
export function validateQRToken(token: string): QRValidationResult {
  try {
    const lastDot = token.lastIndexOf('.');
    if (lastDot === -1) return { valid: false, error: 'Malformed token' };

    const encrypted = token.substring(0, lastDot);
    const sig = token.substring(lastDot + 1);

    // Verify HMAC signature
    const expectedSig = hmacSign(encrypted);
    if (
      sig.length !== expectedSig.length ||
      !crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expectedSig, 'hex'))
    ) {
      return { valid: false, error: 'Invalid signature' };
    }

    // Decrypt
    const payloadJson = decryptAES(encrypted, RAW_ENCRYPTION_KEY);
    const payload: QRTokenPayload = JSON.parse(payloadJson);

    // Check expiry
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired', payload };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, error: 'Token decode failed' };
  }
}

/**
 * Generate QR expiry date (1 year from now, or day after event).
 */
export function qrExpiryFromEventDate(eventDate: string): Date {
  const evDate = new Date(eventDate);
  // Expires at midnight after the event day
  evDate.setDate(evDate.getDate() + 1);
  evDate.setHours(23, 59, 59, 0);
  return evDate;
}
