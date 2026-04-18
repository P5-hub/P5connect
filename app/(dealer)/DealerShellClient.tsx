"use client";

import DealerShell from "./DealerShell";
import I18nProvider from "@/lib/i18n/I18nProvider";

export default function DealerShellClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <I18nProvider>
      <DealerShell>{children}</DealerShell>
    </I18nProvider>
  );
}