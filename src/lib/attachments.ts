export interface ExpenseAttachment {
  displayName: string
  mimeType: string
  base64Data: string
  originalFileName: string
  normalizedFileName: string
}

export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
] as const

export const MAX_ATTACHMENT_COUNT = 6
export const MAX_ATTACHMENT_SIZE_BYTES = 8 * 1024 * 1024 // 8MB
export const MAX_TOTAL_ATTACHMENTS_SIZE_BYTES = 20 * 1024 * 1024 // 20MB

const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf'
}

export function isAllowedAttachmentMimeType(mimeType: string): boolean {
  return ALLOWED_ATTACHMENT_MIME_TYPES.includes(mimeType as (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number])
}

export function sanitizeFileNameSegment(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
}

export function inferExtension(mimeType: string, fileName?: string): string {
  if (MIME_EXTENSION_MAP[mimeType]) {
    return MIME_EXTENSION_MAP[mimeType]
  }
  if (fileName && fileName.includes('.')) {
    const fromName = fileName.split('.').pop()?.toLowerCase()
    if (fromName && /^[a-z0-9]+$/.test(fromName)) {
      return fromName
    }
  }
  return 'bin'
}

export function buildAttachmentBaseName(params: {
  date: string
  branch: string
  expenseType: string
  amount: string
}): string {
  const typeShort = params.expenseType ? params.expenseType.replace(/\s+/g, ' ').trim() : ''
  const formattedAmount = params.amount.replace(',', '.')
  return sanitizeFileNameSegment(`${params.date} - ${params.branch}${typeShort ? ' - ' + typeShort : ''} - ${formattedAmount}`)
}

export function buildNormalizedFileNames(
  attachments: Array<Pick<ExpenseAttachment, 'mimeType' | 'originalFileName'>>,
  params: {
    date: string
    branch: string
    expenseType: string
    amount: string
  }
): string[] {
  const baseName = buildAttachmentBaseName(params)
  const addIndex = attachments.length > 1
  return attachments.map((attachment, index) => {
    const extension = inferExtension(attachment.mimeType, attachment.originalFileName)
    const suffix = addIndex ? ` - ${String(index + 1).padStart(2, '0')}` : ''
    return `${baseName}${suffix}.${extension}`
  })
}
