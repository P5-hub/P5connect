"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme/ThemeContext";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

type Props = {
  onApprove: () => void;
  onReject: () => void;
  onReset: () => void;
  disabled?: boolean;
};

export default function ThemedActionButtons({
  onApprove,
  onReject,
  onReset,
  disabled = false,
}: Props) {
  const theme = useTheme();

  return (
    <div className="flex flex-wrap gap-2 mt-5">
      {/* ✅ Bestätigen */}
      <Button
        size="sm"
        disabled={disabled}
        onClick={onApprove}
        className={`
          border ${theme.border} text-sm rounded-md shadow-sm
          ${theme.color} bg-white hover:${theme.bgLight}
          flex items-center gap-1 transition-all
        `}
      >
        <CheckCircle className={`${theme.color} w-4 h-4`} />
        <span>Bestätigen</span>
      </Button>

      {/* ❌ Ablehnen */}
      <Button
        size="sm"
        disabled={disabled}
        onClick={onReject}
        className={`
          border ${theme.border} text-sm rounded-md shadow-sm
          ${theme.color} bg-white hover:${theme.bgLight}
          flex items-center gap-1 transition-all
        `}
      >
        <XCircle className={`${theme.color} w-4 h-4`} />
        <span>Ablehnen</span>
      </Button>

      {/* 🔄 Zurücksetzen */}
      <Button
        size="sm"
        disabled={disabled}
        onClick={onReset}
        className={`
          border ${theme.border} text-sm rounded-md shadow-sm
          ${theme.color} bg-white hover:${theme.bgLight}
          flex items-center gap-1 transition-all
        `}
      >
        <RotateCcw className={`${theme.color} w-4 h-4`} />
        <span>Zurücksetzen</span>
      </Button>
    </div>
  );
}
