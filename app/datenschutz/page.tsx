export default function Datenschutz() {
  return (
    <main className="max-w-3xl mx-auto p-8 text-sm leading-relaxed space-y-10">

      {/* 🇩🇪 DEUTSCH */}
      <section>
        <h1 className="text-2xl font-semibold mb-4">Datenschutzerklärung</h1>

        <p className="mb-4">
          Der Schutz Ihrer persönlichen Daten ist uns wichtig. Diese Seite
          informiert über Art, Umfang und Zweck der Verarbeitung personenbezogener
          Daten im P5connect Partnerportal.
        </p>

        <p className="mb-4">
          <strong>Verantwortliche Stelle:</strong><br />
          P5connect.ch<br />
          8047 Zürich<br />
          Schweiz<br />
          support@p5connect.ch
        </p>

        <p className="mb-4">
          Im Portal werden Login-Daten, Unternehmensinformationen,
          Verkaufszahlen, Projektanfragen und Bestelldaten verarbeitet. Die
          Verarbeitung dient ausschliesslich der Bereitstellung des
          Partnerportals.
        </p>

        <p className="mb-4">
          Die Verbindung erfolgt verschlüsselt (HTTPS). Daten werden nicht an
          unbefugte Dritte weitergegeben.
        </p>

        <p>
          Sie haben das Recht auf Auskunft, Berichtigung oder Löschung Ihrer
          gespeicherten Daten im Rahmen der gesetzlichen Bestimmungen.
        </p>
      </section>

      {/* 🇬🇧 ENGLISH */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>

        <p className="mb-4">
          Protecting your personal data is important to us. This page explains
          the type, scope, and purpose of the processing of personal data within
          the P5connect partner portal.
        </p>

        <p className="mb-4">
          <strong>Responsible entity:</strong><br />
          P5connect.ch<br />
          8047 Zurich<br />
          Switzerland<br />
          support@p5connect.ch
        </p>

        <p className="mb-4">
          Within the portal, login data, company information, sales reports,
          project requests and order data are processed. This processing is
          solely for providing the partner portal services.
        </p>

        <p className="mb-4">
          The connection is encrypted (HTTPS). Data is not shared with
          unauthorized third parties.
        </p>

        <p>
          You have the right to request information, correction, or deletion of
          your stored personal data within the limits of applicable laws.
        </p>
      </section>

    </main>
  );
}
