/**
 * ZIP utility functions
 * Uses JSZip for creating ZIP archives
 */

export interface ZipFile {
  name: string
  blob: Blob
}

/**
 * Create a ZIP file from multiple blobs
 */
export async function createZip (files: ZipFile[]): Promise<Blob> {
  // Lazy-load JSZip only when actually creating a ZIP (~100KB)
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()

  // Add each file to the ZIP
  for (const file of files) {
    zip.file(file.name, file.blob)
  }

  // Generate ZIP blob
  return zip.generateAsync({ type: 'blob' })
}
