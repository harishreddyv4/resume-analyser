"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud } from "lucide-react";
import { fileFromDataTransfer } from "@/lib/file-from-data-transfer";
import { resumeAcceptAttribute } from "@/lib/uploads";

type ResumeDropzoneProps = {
  id: string;
  disabled: boolean;
  file: File | null;
  error?: string;
  progress: number;
  /** Shown under the progress bar while uploading (e.g. phased copy). */
  progressHint?: string;
  isUploading: boolean;
  onChangeFile: (file: File | null) => void;
};

export function ResumeDropzone({
  id,
  disabled,
  file,
  error,
  progress,
  progressHint,
  isUploading,
  onChangeFile,
}: ResumeDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const openPicker = () => {
    if (disabled) {
      return;
    }
    const el = inputRef.current;
    if (!el) {
      return;
    }
    el.value = "";
    el.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-zinc-800" htmlFor={id}>
        Resume
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={resumeAcceptAttribute}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => onChangeFile(e.target.files?.[0] ?? null)}
      />
      <div
        className={`rounded-xl border border-dashed transition-colors ${
          dragging ? "border-zinc-900 bg-zinc-100" : "border-zinc-300 bg-zinc-50"
        } ${error ? "ring-1 ring-red-200" : ""} ${disabled ? "opacity-60" : ""}`}
        onDragEnter={(e) => {
          e.preventDefault();
          if (!disabled) {
            setDragging(true);
          }
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled) {
            return;
          }
          onChangeFile(fileFromDataTransfer(e.dataTransfer));
        }}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          className="flex w-full flex-col items-center px-6 py-10 text-center sm:py-12"
        >
          <UploadCloud className="h-9 w-9 text-zinc-400" aria-hidden />
          <span className="mt-3 text-sm font-semibold text-zinc-900">
            {file ? "Replace file" : "Drop file or click to upload"}
          </span>
          <span className="mt-1 text-xs text-zinc-500">
            PDF, DOC, or DOCX · up to 10 MB
          </span>
        </button>
      </div>

      {isUploading ? (
        <div className="space-y-2 rounded-lg border border-zinc-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
            <span>{progressHint ?? "Uploading"}</span>
            <span className="tabular-nums text-zinc-900">{Math.round(progress)}%</span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={progressHint ?? "Upload progress"}
          >
            <div
              className="h-full rounded-full bg-zinc-900 transition-[width] duration-150 ease-out"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      ) : null}

      {file && !isUploading ? (
        <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700">
          <FileText className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-medium">
            {file.name}
          </span>
          <button
            type="button"
            disabled={disabled}
            className="shrink-0 text-xs font-semibold text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline disabled:opacity-50"
            onClick={() => onChangeFile(null)}
          >
            Remove
          </button>
        </div>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
