import DealerServerWrapper from "./DealerServerWrapper";
import DealerShell from "./DealerShell";
import I18nProvider from "@/lib/i18n/I18nProvider";
import ActingDealerBanner from "@/components/ActingDealerBanner";
import PromotionLoginPopup from "./components/promotions/PromotionLoginPopup";

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DealerServerWrapper>
      <I18nProvider>
        <ActingDealerBanner />
        <PromotionLoginPopup />
        <DealerShell>{children}</DealerShell>
      </I18nProvider>
    </DealerServerWrapper>
  );
}