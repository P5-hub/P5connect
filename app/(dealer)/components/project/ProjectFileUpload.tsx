"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Trash2 } from "lucide-react";
import { useTheme } from "@/lib/theme/ThemeContext";

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  accept?: string;
  title?: string;
};

export default function ProjectFileUpload({
  files,
  onChange,
  accept = ".pdf,.csv,.xlsx,.xls,image/*",
  title = "Dateien hochladen",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const theme = useTheme();

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const merged = [...files];

    Array.from(newFiles).forEach((f) => {
      if (!merged.some((m) => m.name === f.name && m.size === f.size)) {
        merged.push(f);
      }
    });

    onChange(merged);
  };

  const removeFile = (index: number) => {
    const copy = [...files];
    copy.splice(index, 1);
    onChange(copy);
  };

  return (
    <div className={`border rounded-xl p-4 space-y-3 ${theme.bgLight} ${theme.border}`}>
      {/* TITLE */}
      <p className={`text-sm font-semibold flex items-center gap-2 ${theme.color}`}>
        <Upload className="w-4 h-4" />
        {title}
      </p>

      {/* DROP ZONE */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles(e.dataTransfer.files);
        }}
        className={`
          cursor-pointer
          border-2 border-dashed
          rounded-lg
          p-4
          text-center
          text-sm
          text-gray-600
          transition
          ${theme.border}
          ${theme.bgLight}
        `}
      >
        Dateien hierher ziehen oder klicken
        <div className="text-xs text-gray-500 mt-1">
          Erlaubt: PDF, Excel, Screenshots & Bilder
        </div>
      </div>

      {/* FILE INPUT */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* FILE LIST */}
      {files.length > 0 && (
        <div className="space-y-1 text-sm">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-2 bg-white border rounded px-2 py-1"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className={`w-4 h-4 ${theme.color}`} />
                <span className="truncate">{file.name}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeFile(idx)}
                title="Datei entfernen"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
