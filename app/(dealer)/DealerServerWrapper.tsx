// Server Component — darf KEINE Funktionen erzeugen
import DealerClientWrapper from "./DealerClientWrapper";
import { Dealer } from "./DealerContext";

export default function DealerServerWrapper({
  dealer,
  children,
}: {
  dealer: Dealer | null;
  children: React.ReactNode;
}) {
  return (
    <DealerClientWrapper dealer={dealer}>
      {children}
    </DealerClientWrapper>
  );
}
