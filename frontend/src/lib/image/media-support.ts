export const getHeicSupport = () => {
  const ua = navigator.userAgent

  // A. Determining whether it is iOS (iPhone/iPad)
  // Since iPadOS 13 and later disguises itself as "Macintosh", determine by the number of touch points
  const isIOS = /iP(hone|od|ad)/.test(ua) ||
    (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)

  if (isIOS) return true

  // B. Determining whether it is Mac Safari
  // The string "Safari" is also included in Chrome, so Chrome needs to be excluded
  const isMacSafari = ua.includes('Macintosh') &&
    ua.includes('Safari') &&
    ua.includes('Version/') &&
    !ua.includes('Chrome') &&
    !ua.includes('Chromium') &&
    !isIOS

  return isMacSafari
}
