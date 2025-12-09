export const dynamic = "force-dynamic";

import { ReactNode } from "react";
import I18nProvider from "@/lib/i18n/I18nProvider";
import { ThemeProvider } from "@/lib/theme/ThemeContext";
import DealerShellClient from "./DealerShellClient";

export default function DealerLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <DealerShellClient>{children}</DealerShellClient>
      </ThemeProvider>
    </I18nProvider>
  );
}
