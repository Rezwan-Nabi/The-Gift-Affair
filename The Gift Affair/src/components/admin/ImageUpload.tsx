"use client";

import { ImageUp, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, STORAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { imageUrl, slugify } from "@/lib/utils";

type Props = {
  /** Folder inside the bucket, e.g. "gifts" or "guides". */
  folder: string;
  value: string | null;
  onChange: (path: string | null) => void;
  label: string;
  error?: string;
};

/**
 * Uploads straight from the browser to Supabase Storage with the editor's session.
 * Storage policies only allow editors, and the bucket itself enforces the size and type limits.
 */
export default function ImageUpload({ folder, value, onChange, label, error }: Props) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const src = imageUrl(value);

  async function upload(file: File) {
    setMessage("");
    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      setMessage("Use a JPG, PNG, WebP or AVIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setMessage(`This image is ${(file.size / 1024 / 1024).toFixed(1)} MB. Compress it to under 5 MB and try again.`);
      return;
    }
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
    const now = new Date();
    const path = `${folder}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
    const { error: upErr } = await createClient().storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });
    setBusy(false);
    if (upErr) {
      setMessage("The upload didn't finish. Check your connection and try again.");
      return;
    }
    onChange(path);
  }

  return (
    <div>
      <p id={`${id}-label`} className="mb-1.5 font-semibold">
        {label}
      </p>
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative size-32 shrink-0 overflow-hidden rounded-xl bg-lavender-soft ring-1 ring-plum-line">
          {src ? (
            <Image src={src} alt="" fill sizes="8rem" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-plum-soft">No image</span>
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            className="sr-only"
            aria-labelledby={`${id}-label`}
            aria-describedby={`${id}-hint`}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border-[1.5px] border-plum/70 px-4 text-sm font-semibold hover:bg-plum hover:text-cream disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <ImageUp className="size-4" aria-hidden="true" />}
              {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
            </button>
            {value && !busy && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold hover:bg-plum/6"
              >
                <X className="size-4" aria-hidden="true" /> Remove
              </button>
            )}
          </div>
          <p id={`${id}-hint`} className="text-sm text-plum-soft">
            JPG, PNG, WebP or AVIF, up to 5 MB. Use images you own or have permission to use.
          </p>
          {(message || error) && (
            <p role="alert" className="text-sm font-medium text-danger">
              {message || error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
