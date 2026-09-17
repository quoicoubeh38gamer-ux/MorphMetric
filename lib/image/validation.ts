// Server-side image validation for the raw-upload path.
//
// The DB-less MVP scores from a client fingerprint and does not upload raw
// pixels, but when private-storage upload is enabled this is the server guard:
// MIME allowlist, size limit, and magic-byte sniffing so a renamed file can't
// slip through a Content-Type check.

const MAGIC: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF" (WEBP container)
];

export interface UploadValidationOptions {
  maxBytes: number;
  allowed?: string[];
}

export interface UploadValidationResult {
  ok: boolean;
  error?: string;
  detectedMime?: string;
}

export async function validateImageUpload(
  file: Blob,
  opts: UploadValidationOptions,
): Promise<UploadValidationResult> {
  const allowed = opts.allowed ?? ["image/jpeg", "image/png", "image/webp"];
  if (file.size > opts.maxBytes) {
    return { ok: false, error: "File is too large." };
  }
  if (file.type && !allowed.includes(file.type)) {
    return { ok: false, error: "Unsupported image type." };
  }

  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const match = MAGIC.find((m) => m.bytes.every((b, i) => head[i] === b));
  if (!match || !allowed.includes(match.mime)) {
    return { ok: false, error: "File content is not a supported image." };
  }
  return { ok: true, detectedMime: match.mime };
}
