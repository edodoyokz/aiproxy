import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY
const SALT = 'aiproxy-salt-v1'

/**
 * Encrypts plaintext using AES-256-GCM
 * Returns format: iv:ciphertext:tag (hex encoded)
 */
export function encrypt(plaintext: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }

  // Derive a 32-byte key from the environment variable
  const key = scryptSync(ENCRYPTION_KEY, SALT, 32)

  // Generate a random IV (12 bytes for GCM)
  const iv = randomBytes(12)

  // Create cipher
  const cipher = createCipheriv('aes-256-gcm', key, iv)

  // Encrypt
  let ciphertext = cipher.update(plaintext, 'utf8', 'hex')
  ciphertext += cipher.final('hex')

  // Get authentication tag
  const tag = cipher.getAuthTag()

  // Return format: iv:ciphertext:tag (hex encoded)
  return `${iv.toString('hex')}:${ciphertext}:${tag.toString('hex')}`
}

/**
 * Decrypts ciphertext using AES-256-GCM
 * Expects format: iv:ciphertext:tag (hex encoded)
 */
export function decrypt(encrypted: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required')
  }

  // Derive the same key
  const key = scryptSync(ENCRYPTION_KEY, SALT, 32)

  // Parse the encrypted format
  const parts = encrypted.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted format')
  }

  const iv = Buffer.from(parts[0], 'hex')
  const ciphertext = parts[1]
  const tag = Buffer.from(parts[2], 'hex')

  // Create decipher
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)

  // Decrypt
  let plaintext = decipher.update(ciphertext, 'hex', 'utf8')
  plaintext += decipher.final('utf8')

  return plaintext
}
