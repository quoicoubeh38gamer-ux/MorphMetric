// Server-side image validation for the raw-upload path.
//
// The DB-less MVP scores from a client fingerprint and does not upload raw
// pixels, but when private-storage upload is enabled this is the server guard:
// MIME allowlist, size limit, and magic-byte sniffing so a renamed file can't
// slip through a Content-Type check.

// `at` lets a signature check bytes further into the header. WebP is a RIFF
// container, so "RIFF" alone is not enough — a .wav would pass. We also require
// the "WEBP" form type at offset 8.
const MAGIC: { mime: string; parts: { at: number; bytes: number[] }[] }[] = [
  { mime: "image/jpeg", parts: [{ at: 0, bytes: [0xff, 0xd8, 0xff] }] },
  { mime: "image/png", parts: [{ at: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }] },
  {
    mime: "image/webp",
    parts: [
      { at: 0, bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF"
      { at: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // "WEBP"
    ],
  },
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

  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const match = MAGIC.find((m) =>
    m.parts.every((part) => part.bytes.every((b, i) => head[part.at + i] === b)),
  );
  if (!match || !allowed.includes(match.mime)) {
    return { ok: false, error: "File content is not a supported image." };
  }
  // A declared Content-Type that disagrees with the real bytes is a spoof
  // attempt — reject rather than trusting either side.
  if (file.type && file.type !== match.mime) {
    return { ok: false, error: "Image type does not match its content." };
  }
  return { ok: true, detectedMime: match.mime };
}
