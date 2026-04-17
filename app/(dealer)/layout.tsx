import DealerServerWrapper from "./DealerServerWrapper";
import DealerShell from "./DealerShell";

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DealerServerWrapper>
      <DealerShell>{children}</DealerShell>
    </DealerServerWrapper>
  );
}