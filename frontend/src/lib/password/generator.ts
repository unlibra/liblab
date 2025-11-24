/**
 * Password generation utilities
 */

export type PasswordOptions = {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
  avoidAmbiguous: boolean
}

// Character sets
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*-_+=?'

// Ambiguous characters to avoid
const AMBIGUOUS = '0O1lI'

/**
 * Generate a password based on provided options.
 *
 * Ensures at least one character from each selected charset (up to length),
 * shuffles characters, and avoids ambiguous characters when requested.
 */
export function generatePassword (options: PasswordOptions): string {
  // Build character sets
  const charsets: string[] = []
  if (options.uppercase) charsets.push(UPPERCASE)
  if (options.lowercase) charsets.push(LOWERCASE)
  if (options.numbers) charsets.push(NUMBERS)
  if (options.symbols) charsets.push(SYMBOLS)

  if (charsets.length === 0) {
    return ''
  }

  // Remove ambiguous characters if option is enabled
  const cleanCharsets = options.avoidAmbiguous
    ? charsets.map(set => set.split('').filter(c => !AMBIGUOUS.includes(c)).join(''))
      .filter(set => set.length > 0) // Remove empty sets after filtering
    : charsets

  if (cleanCharsets.length === 0) {
    return '' // All charsets became empty after filtering
  }

  // If there are more charsets than the requested length, randomly choose which
  // charsets to guarantee so we don't always drop the same ones.
  const selectedCharsets = [...cleanCharsets]
  if (selectedCharsets.length > options.length) {
    const shuffleOrder = new Uint32Array(selectedCharsets.length)
    crypto.getRandomValues(shuffleOrder)
    for (let i = selectedCharsets.length - 1; i > 0; i--) {
      const j = shuffleOrder[i] % (i + 1);
      [selectedCharsets[i], selectedCharsets[j]] = [selectedCharsets[j], selectedCharsets[i]]
    }
    selectedCharsets.length = options.length
  }

  // Combine all characters
  const allChars = selectedCharsets.join('')

  // Calculate exact number of random values needed
  // For guarantee mode: min(selectedCharsets.length, options.length) picks + remaining fills + shuffle
  const guaranteeCount = Math.min(selectedCharsets.length, options.length)
  const fillCount = options.length - guaranteeCount
  const shuffleCount = options.length
  const randomCount = guaranteeCount + fillCount + shuffleCount

  const array = new Uint32Array(randomCount)
  crypto.getRandomValues(array)
  let arrayIndex = 0

  const password: string[] = []

  // Add one character from each charset (up to password length)
  for (let i = 0; i < guaranteeCount; i++) {
    const charset = selectedCharsets[i]
    password.push(charset[array[arrayIndex++] % charset.length])
  }

  // Fill remaining length with random characters from all charsets
  for (let i = 0; i < fillCount; i++) {
    password.push(allChars[array[arrayIndex++] % allChars.length])
  }

  // Shuffle the password to avoid predictable patterns
  for (let i = password.length - 1; i > 0; i--) {
    const j = array[arrayIndex++] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
}
