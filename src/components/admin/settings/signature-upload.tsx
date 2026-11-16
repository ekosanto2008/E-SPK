"use client";

import { Button } from "@/components/ui/button";
import { TrashBinIcon, UploadIcon } from "@/icons";
import Image from "next/image";
import { useRef, useState } from "react";

interface SignatureUploadProps {
  currentUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
}

export default function SignatureUpload({
  currentUrl,
  onFileSelect,
  onRemove,
}: SignatureUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran file maksimal 2MB");
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onFileSelect(null);
    onRemove();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="relative flex h-28 w-48 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 overflow-hidden">
          {preview ? (
            <Image
              src={preview}
              alt="TTD Laksma"
              fill
              unoptimized
              className="object-contain p-2"
            />
          ) : (
            <span className="text-xs text-gray-400">Belum ada scan TTD</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
          >
            <UploadIcon className="size-4 me-1.5" />
            {preview ? "Ganti TTD" : "Unggah Scan TTD"}
          </Button>

          {preview && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
            >
              <TrashBinIcon className="size-4 me-1.5" />
              Hapus
            </Button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Format file: PNG/JPG transparan lebih disukai, maksimal 2MB.
      </p>
    </div>
  );
}

