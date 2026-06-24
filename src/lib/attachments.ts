import {
  ALLOWED_ATTACHMENT_MIME_TYPES,
  MIME_EXTENSION_MAP,
  type ExpenseAttachment,
} from "@/constants/piecesJointes";

export function isAllowedAttachmentMimeType(mimeType: string): boolean {
  return ALLOWED_ATTACHMENT_MIME_TYPES.includes(
    mimeType as (typeof ALLOWED_ATTACHMENT_MIME_TYPES)[number],
  );
}

export function sanitizeFileNameSegment(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function inferExtension(mimeType: string, fileName?: string): string {
  if (MIME_EXTENSION_MAP[mimeType]) {
    return MIME_EXTENSION_MAP[mimeType];
  }
  if (fileName && fileName.includes(".")) {
    const fromName = fileName.split(".").pop()?.toLowerCase();
    if (fromName && /^[a-z0-9]+$/.test(fromName)) {
      return fromName;
    }
  }
  return "bin";
}

export function buildAttachmentBaseName(params: {
  date: string;
  branch: string;
  expenseType: string;
  amount: string;
}): string {
  const typeShort = params.expenseType
    ? params.expenseType.replace(/\s+/g, " ").trim()
    : "";
  const formattedAmount = params.amount.replace(",", ".");
  return sanitizeFileNameSegment(
    `${params.date} - ${params.branch}${typeShort ? " - " + typeShort : ""} - ${formattedAmount}`,
  );
}

export function buildNormalizedFileNames(
  attachments: Array<Pick<ExpenseAttachment, "mimeType" | "originalFileName">>,
  params: {
    date: string;
    branch: string;
    expenseType: string;
    amount: string;
  },
): string[] {
  const baseName = buildAttachmentBaseName(params);
  const addIndex = attachments.length > 1;
  return attachments.map((attachment, index) => {
    const extension = inferExtension(
      attachment.mimeType,
      attachment.originalFileName,
    );
    const suffix = addIndex ? ` - ${String(index + 1).padStart(2, "0")}` : "";
    return `${baseName}${suffix}.${extension}`;
  });
}
