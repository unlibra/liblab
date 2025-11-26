/**
 * API error handling utilities
 */

/**
 * Extract detailed error message from API response
 * Falls back to a generic message if extraction fails
 */
export async function extractApiErrorMessage (
  response: Response,
  fallbackMessage: string
): Promise<string> {
  try {
    const data = await response.json()

    // FastAPI HTTPException format: {"detail": "error message"}
    if (data.detail && typeof data.detail === 'string') {
      return data.detail
    }

    // Other formats
    if (data.message && typeof data.message === 'string') {
      return data.message
    }

    if (data.error && typeof data.error === 'string') {
      return data.error
    }
  } catch {
    // Failed to parse JSON or extract message
  }

  // Fallback to generic message
  return fallbackMessage
}

/**
 * Handle API fetch errors with detailed messages
 * @returns Error message to display to user
 */
export async function handleApiFetchError (
  response: Response,
  fallbackMessage: string
): Promise<string> {
  // Handle rate limit error (429) with dedicated message
  if (response.status === 429) {
    return 'アクセスが集中しています。しばらく待ってから再度お試しください。'
  }

  const detailedMessage = await extractApiErrorMessage(response, fallbackMessage)
  return detailedMessage
}
