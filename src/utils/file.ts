/**
 * Convert byte values into human-readable string formats (e.g. 1.2 MB, 320 KB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Validates whether a file extension is supported
 */
export function isFormatSupported(fileName: string, allowedExtensions: string[]): boolean {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return allowedExtensions.includes(ext);
}
