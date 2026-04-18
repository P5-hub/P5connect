import DealerServerWrapper from "./DealerServerWrapper";
import DealerShell from "./DealerShell";
import I18nProvider from "@/lib/i18n/I18nProvider";

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DealerServerWrapper>
      <I18nProvider>
        <DealerShell>{children}</DealerShell>
      </I18nProvider>
    </DealerServerWrapper>
  );
}