import HändlerLanding from "@/components/HändlerLanding";

export default function LandingPage() {
  // Später ersetzt du das durch echten Login-Kontext
  const demoDealer = { name: "Demo Händler" };

  return <HändlerLanding dealer={demoDealer} />;
}
