export const ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const MAX_ATTACHMENT_COUNT = 6;
export const MAX_ATTACHMENT_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
export const MAX_TOTAL_ATTACHMENTS_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export interface ExpenseAttachment {
  displayName: string;
  mimeType: string;
  base64Data: string;
  originalFileName: string;
  normalizedFileName: string;
}
