export default function Impressum() {
  return (
    <main className="max-w-3xl mx-auto p-8 text-sm leading-relaxed space-y-10">

      {/* 🇩🇪 DEUTSCH */}
      <section>
        <h1 className="text-2xl font-semibold mb-4">Impressum</h1>

        <p className="mb-4">
          <strong>Betreiber der Website</strong><br />
          P5connect.ch<br />
          8047 Zürich<br />
          Schweiz<br />
          E-Mail: support@p5connect.ch
        </p>

        <p className="mb-4">
          Die Inhalte dieser Website werden mit grösster Sorgfalt erstellt. Für die
          Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen wir
          jedoch keine Gewähr.
        </p>

        <p className="mb-4">
          Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung
          für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind
          ausschliesslich deren Betreiber verantwortlich.
        </p>

        <p>
          Die auf dieser Website veröffentlichten Inhalte unterliegen dem
          schweizerischen Urheberrecht.
        </p>
      </section>

      {/* 🇬🇧 ENGLISH */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Legal Notice</h2>

        <p className="mb-4">
          <strong>Website operator</strong><br />
          P5connect.ch<br />
          8047 Zurich<br />
          Switzerland<br />
          Email: support@p5connect.ch
        </p>

        <p className="mb-4">
          The contents of this website are created with the greatest possible care.
          However, we do not guarantee the accuracy, completeness, or timeliness of
          the content.
        </p>

        <p className="mb-4">
          Despite careful content control, we assume no liability for the content
          of external links. The operators of the linked pages are solely
          responsible for their content.
        </p>

        <p>
          The content published on this website is subject to Swiss copyright law.
        </p>
      </section>

    </main>
  );
}
