"use client";

import { useTheme } from "@/lib/theme/ThemeContext";

export default function P5Logo({ size = 28, withText = true }: { size?: number; withText?: boolean }) {
  const theme = useTheme();

  return (
    <div className="flex items-center gap-2 select-none">
      {/* SVG-Logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="shrink-0"
      >
        {/* P */}
        <path
          d="M10 10h14c8 0 14 5 14 12s-6 12-14 12h-6v20H10V10zM18 26h6c3 0 6-2 6-4s-3-4-6-4h-6v8z"
          fill="#333"
        />
        {/* 5 */}
        <path
          d="M50 14c-6 0-10 3-10 8h6c0-2 2-3 4-3 2 0 4 1 4 3 0 3-3 4-7 4h-4v4h4c4 0 7 1 7 4 0 2-2 4-5 4s-5-1-5-3h-6c0 5 4 9 11 9 6 0 11-3 11-9 0-4-2-6-6-7 4-1 6-4 6-7 0-6-5-9-11-9z"
          className={theme.color}
        />
      </svg>

      {/* Text daneben */}
      {withText && (
        <span className="text-xl font-bold tracking-tight">
          <span className="text-gray-800">P</span>
          <span className={theme.color}>5</span>
          <span className="text-gray-700">connect</span>
        </span>
      )}
    </div>
  );
}
