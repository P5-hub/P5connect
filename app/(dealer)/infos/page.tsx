"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import {
  LifeBuoy,
  FileDown,
  Users,
  Headphones,
  Newspaper,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  ChevronDown,
  Languages,
  ArrowRight,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useI18n } from "@/lib/i18n/I18nProvider";

export default function InfosPage() {
  const { t } = useI18n();

  // =========================================================
  // NEWSLETTER
  // =========================================================
  const newsletters = [
    {
      id: "sep2026",
      date: "September 2026",
      title: "BRAVIA Update",
      description:
        "Aktuelle BRAVIA News, Produkte, Aktionen und wichtige Informationen für P5 Partner.",
      current: true,
      languages: [
        {
          label: "Deutsch",
          short: "DE",
          file: "/newsletter/BRAVIA-Update-September-2026-DE-mit-Bildern.html",
        },
        {
          label: "Français",
          short: "FR",
          file: "/newsletter/BRAVIA-Update-Septembre-2026-FR-avec-images.html",
        },
      ],
    },
    {
      id: "jul2026",
      date: "Juli 2026",
      title: "BRAVIA News",
      description:
        "BRAVIA News und Informationen für P5 Partner aus der Juli-Ausgabe.",
      current: false,
      languages: [
        {
          label: "Deutsch",
          short: "DE",
          file: "/newsletter/BRAVIA-News-Juli-2026-mit-Bildern.html",
        },
        {
          label: "Français",
          short: "FR",
          file: "/newsletter/BRAVIA-News-Juillet-2026-FR-avec-images.html",
        },
      ],
    },
  ];

  const currentNewsletter = newsletters[0];
  const archiveNewsletters = newsletters.slice(1);

  // =========================================================
  // DOWNLOADS
  // =========================================================
  const downloads = [
    {
      name: "DOA-Formular",
      description: "DOA-Fall erfassen",
      file: "/docs/DOA-Formular.pdf",
    },
    {
      name: "DOA-Regelung",
      description: "Aktuelle Regelung",
      file: "/docs/DOA-Regelung-DE.pdf",
    },
    {
      name: t("infos.downloads.sertronics"),
      description: "Anmeldung & Unterlagen",
      file: "/docs/Anmeldung_Sertronics.pdf",
    },
  ];

  // =========================================================
  // KAM
  // =========================================================
  const keyAccountManagers = [
    {
      name: "Matthias Violante",
      role: "Key Account Manager D-CH",
      email: "matthias.violante@sony.com",
      phone: "+41 79 500 71 64",
      img: "/contacts/matthias-violante.jpg",
    },
    {
      name: "Guenther Duersteler",
      role: "Key Account Manager W-CH",
      email: "guenther.duersteler@sony.com",
      phone: "+41 79 478 80 10",
      img: "/contacts/guenther-duersteler.jpg",
    },
    {
      name: "Luca Lucibello",
      role: "Key Account Manager I-CH",
      email: "luca.lucibello@sony.com",
      phone: "+41 79 619 59 52",
      img: "/contacts/luca-lucibello.jpg",
    },
  ];

  // =========================================================
  // VERKAUF INNENDIENST
  // =========================================================
  const salesSupport = [
    {
      name: "Lőrinc Szánthó",
      role: "Commercial Investment Team Lead",
      email: "Lorinc.Szantho@sony.com",
      team: "SBO CI Europe",
      phone: "+41 848 870 878",
      img: "/contacts/szánthó-lőrinc.jpg",
    },
    {
      name: "Orsolya Panyi",
      role: "Sales Support Specialist",
      email: "panyi.orsolya@sony.com",
      team: "SBOE CI1 – Budapest",
      phone: "+41 848 870 878",
      img: "/contacts/panyi_orsolya.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-10">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <header className="border-b-2 border-[#1F3B9B] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1F3B9B]/10">
              <LifeBuoy className="h-6 w-6 text-[#1F3B9B]" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {t("infos.title")}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Support, Ansprechpartner, Dokumente und aktuelle Informationen
                für Sony P5 Partner.
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            AKTUELL & SCHNELLZUGRIFF
        ===================================================== */}
        <section>
          <SectionTitle
            icon={<Newspaper className="h-5 w-5" />}
            title="Aktuell & Schnellzugriff"
            subtitle="Die wichtigsten Informationen und Dokumente auf einen Blick."
          />

          <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">

            {/* Aktueller Newsletter */}
            <Card className="overflow-hidden border border-[#1F3B9B]/30 bg-white shadow-sm">
              <div className="bg-[#1F3B9B] px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white">
                Aktuelle Ausgabe
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#1F3B9B]">
                      {currentNewsletter.date}
                    </p>

                    <h2 className="mt-2 text-xl font-semibold text-gray-900">
                      {currentNewsletter.title}
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600">
                      {currentNewsletter.description}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1F3B9B]/10">
                    <Newspaper className="h-6 w-6 text-[#1F3B9B]" />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="mr-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                    <Languages className="h-4 w-4" />
                    Sprache
                  </div>

                  {currentNewsletter.languages.map((language) => (
                    <Link
                      key={language.short}
                      href={language.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1F3B9B] shadow-sm transition hover:border-[#1F3B9B]/40 hover:bg-[#1F3B9B]/5"
                    >
                      <span className="flex h-6 min-w-7 items-center justify-center rounded bg-gray-100 px-1.5 text-xs font-bold text-gray-600">
                        {language.short}
                      </span>

                      {language.label}

                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Schnellzugriff Dokumente */}
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center gap-2">
                  <FileDown className="h-5 w-5 text-[#1F3B9B]" />

                  <h3 className="font-semibold text-gray-900">
                    Wichtige Dokumente
                  </h3>
                </div>

                <div className="divide-y divide-gray-100">
                  {downloads.map((document) => (
                    <Link
                      key={document.file}
                      href={document.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <FileText className="h-4 w-4 text-[#1F3B9B]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 transition group-hover:text-[#1F3B9B]">
                          {document.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {document.description}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#1F3B9B]" />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* =====================================================
            TECHNISCHER SUPPORT
        ===================================================== */}
        <section>
          <SectionTitle
            icon={<Headphones className="h-5 w-5" />}
            title={t("infos.support.title")}
            subtitle="Technische Unterstützung für Händler und Endkunden."
          />

          <div className="grid gap-5 lg:grid-cols-2">

            {/* Händler Support */}
            <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Händler-Support
                </CardTitle>
              </CardHeader>

              <CardContent className="p-5">
                <div className="flex flex-col gap-6 xl:flex-row">

                  <div className="flex-1 space-y-4">
                    <p className="text-sm text-gray-600">
                      {t("infos.support.hours")}
                    </p>

                    <SupportGroup title={t("infos.support.phone")}>
                      <ContactLine
                        icon={<Phone className="h-4 w-4" />}
                        text="Deutsch: +41 (0)22 761 4182"
                      />
                      <ContactLine
                        icon={<Phone className="h-4 w-4" />}
                        text="Französisch: +41 (0)22 761 4183"
                      />
                      <ContactLine
                        icon={<Phone className="h-4 w-4" />}
                        text="Italienisch: +39 (0)26 968 2104"
                      />
                    </SupportGroup>

                    <SupportGroup title={t("infos.support.email")}>
                      <EmailLink email="dealersupport.ch-de@eu.sony.com" />
                      <EmailLink email="dealersupport.ch-fr@eu.sony.com" />
                      <EmailLink email="dealersupport.ch-it@eu.sony.com" />
                    </SupportGroup>

                    <div className="border-t border-gray-100 pt-4">
                      <Link
                        href="https://www.sony.ch/de/electronics/support"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F3B9B] hover:underline"
                      >
                        Sony Support Schweiz
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Holger */}
                  <div className="w-full shrink-0 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center xl:w-52">
                    <div className="relative mx-auto mb-3 h-28 w-24 overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <Image
                        src="/contacts/holger_stuckenburg.jpg"
                        alt="Holger Stuckenburg"
                        fill
                        unoptimized
                        className="object-cover object-[center_20%]"
                      />
                    </div>

                    <p className="text-sm font-semibold text-gray-900">
                      Holger Stuckenburg
                    </p>

                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      Senior Expert – Service Management
                      <br />
                      DACH Regional LDSM
                    </p>

                    <a
                      href="mailto:Holger.Stuckenburg@sony.com"
                      className="mt-3 block break-all text-xs font-medium text-[#1F3B9B] hover:underline"
                    >
                      Holger.Stuckenburg@sony.com
                    </a>

                    <p className="mt-2 text-xs text-gray-600">
                      +49 30 4195 53356
                    </p>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Endkunden Support */}
            <Card className="overflow-hidden border border-gray-200 bg-white shadow-sm">
              <CardHeader className="border-b border-gray-100 bg-gray-50/70">
                <CardTitle className="text-base font-semibold text-gray-900">
                  Endkunden-Support
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 p-5">
                <p className="text-sm text-gray-600">
                  {t("infos.support.hours")}
                </p>

                <SupportGroup title={t("infos.support.phone")}>
                  <ContactLine
                    icon={<Phone className="h-4 w-4" />}
                    text="Deutsch: +41 (0)22 761 4182"
                  />
                  <ContactLine
                    icon={<Phone className="h-4 w-4" />}
                    text="Französisch: +41 (0)22 761 4183"
                  />
                  <ContactLine
                    icon={<Phone className="h-4 w-4" />}
                    text="Italienisch: +39 (0)26 968 2104"
                  />
                </SupportGroup>

                <SupportGroup title={t("infos.support.email")}>
                  <EmailLink email="customersupport.ch-de@eu.sony.com" />
                  <EmailLink email="customersupport.ch-fr@eu.sony.com" />
                  <EmailLink email="customersupport.ch-it@eu.sony.com" />
                </SupportGroup>
              </CardContent>
            </Card>

          </div>
        </section>

        {/* =====================================================
            KEY ACCOUNT MANAGER
        ===================================================== */}
        <section>
          <SectionTitle
            icon={<Users className="h-5 w-5" />}
            title={t("infos.sales.kam")}
            subtitle="Ihre persönlichen Ansprechpartner im Sony Vertrieb Schweiz."
          />

          <div className="grid gap-5 md:grid-cols-3">
            {keyAccountManagers.map((person) => (
              <ContactCard
                key={person.email}
                name={person.name}
                role={person.role}
                email={person.email}
                phone={person.phone}
                img={person.img}
              />
            ))}
          </div>
        </section>

        {/* =====================================================
            VERKAUF INNENDIENST - KLAPPBAR
        ===================================================== */}
        <section>
          <details className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 transition hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F3B9B]/10">
                  <Users className="h-4.5 w-4.5 text-[#1F3B9B]" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    {t("infos.sales.internal")}
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Unterstützung bei Bestellungen und administrativen Verkaufsthemen
                  </p>
                </div>
              </div>

              <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="border-t border-gray-100 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {salesSupport.map((person) => (
                  <Card
                    key={person.email}
                    className="border border-gray-200 bg-gray-50/50 shadow-none"
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">

                        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <Image
                            src={person.img}
                            alt={person.name}
                            fill
                            unoptimized
                            className="object-cover object-top"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900">
                            {person.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-600">
                            {person.role}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-400">
                            {person.team}
                          </p>

                          <div className="mt-3 space-y-1.5">
                            <EmailLink email={person.email} />

                            <ContactLine
                              icon={<Phone className="h-4 w-4" />}
                              text={person.phone}
                            />
                          </div>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 px-4 py-3">
                <Mail className="h-4 w-4 text-[#1F3B9B]" />

                <span className="text-sm text-gray-500">
                  Zentrale E-Mail:
                </span>

                <a
                  href="mailto:sseschatoperations@sony.com"
                  className="text-sm font-semibold text-[#1F3B9B] hover:underline"
                >
                  sseschatoperations@sony.com
                </a>
              </div>
            </div>
          </details>
        </section>

        {/* =====================================================
            NEWSLETTER ARCHIV
        ===================================================== */}
        {archiveNewsletters.length > 0 && (
          <section>
            <details className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 transition hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F3B9B]/10">
                    <Newspaper className="h-4.5 w-4.5 text-[#1F3B9B]" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Newsletter-Archiv
                    </h2>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Frühere BRAVIA Newsletter anzeigen
                    </p>
                  </div>
                </div>

                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
              </summary>

              <div className="border-t border-gray-100 p-5">
                <div className="space-y-4">
                  {archiveNewsletters.map((newsletter) => (
                    <div
                      key={newsletter.id}
                      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#1F3B9B]">
                          {newsletter.date}
                        </p>

                        <p className="mt-1 font-semibold text-gray-900">
                          {newsletter.title}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {newsletter.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {newsletter.languages.map((language) => (
                          <Link
                            key={language.short}
                            href={language.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-[#1F3B9B] transition hover:border-[#1F3B9B]/30"
                          >
                            {language.short}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          </section>
        )}

      </div>
    </div>
  );
}

// ===========================================================
// SECTION TITLE
// ===========================================================

function SectionTitle({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4 border-b border-gray-200 pb-3">
      <div className="flex items-center gap-2 text-[#1F3B9B]">
        {icon}

        <h2 className="text-base font-semibold">
          {title}
        </h2>
      </div>

      {subtitle && (
        <p className="mt-1 text-sm text-gray-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ===========================================================
// SUPPORT GROUP
// ===========================================================

function SupportGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-gray-800">
        {title}
      </p>

      <div className="space-y-1.5">
        {children}
      </div>
    </div>
  );
}

// ===========================================================
// CONTACT LINE
// ===========================================================

function ContactLine({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="shrink-0 text-gray-400">
        {icon}
      </span>

      <span>{text}</span>
    </div>
  );
}

// ===========================================================
// EMAIL LINK
// ===========================================================

function EmailLink({
  email,
}: {
  email: string;
}) {
  return (
    <a
      href={`mailto:${email}`}
      className="flex items-center gap-2 text-sm text-[#1F3B9B] hover:underline"
    >
      <Mail className="h-4 w-4 shrink-0 text-gray-400" />

      <span className="break-all">
        {email}
      </span>
    </a>
  );
}

// ===========================================================
// KAM CONTACT CARD
// ===========================================================

function ContactCard({
  name,
  role,
  email,
  phone,
  img,
}: {
  name: string;
  role: string;
  email: string;
  phone: string;
  img: string;
}) {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col items-center text-center">

          <div className="relative mb-4 h-36 w-32 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            <Image
              src={img}
              alt={name}
              fill
              unoptimized
              className="object-cover object-top"
            />
          </div>

          <h3 className="font-semibold text-gray-900">
            {name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {role}
          </p>

          <div className="mt-4 w-full border-t border-gray-100 pt-4">
            <a
              href={`mailto:${email}`}
              className="block break-all text-sm font-medium text-[#1F3B9B] hover:underline"
            >
              {email}
            </a>

            <p className="mt-2 text-sm text-gray-600">
              {phone}
            </p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}