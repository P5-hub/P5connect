"use client";

import Image from "next/image";
import Link from "next/link";
import { LifeBuoy, FileDown, Users, Headphones } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function InfosPage() {
  return (
    <div className="space-y-12 pb-20 bg-[#f9fafb] min-h-screen px-4 sm:px-6 lg:px-8 pt-8">
      {/* === TITEL === */}
      <div className="flex items-center gap-2 mb-6 border-b-2 border-[#1F3B9B] pb-2">
        <LifeBuoy className="w-6 h-6 text-[#1F3B9B]" />
        <h1 className="text-2xl font-semibold text-gray-800">
          Support & Kontaktinformationen
        </h1>
      </div>

      {/* === TECHNISCHER SUPPORT === */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-[#1F3B9B] flex items-center gap-2">
          <Headphones className="w-5 h-5 text-[#1F3B9B]" />
          Technischer Support
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Händler-Support */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-2 border-b border-[#1F3B9B]/20">
              <CardTitle className="text-[#1F3B9B] text-base font-semibold flex items-center gap-2">
                🧩 Händler-Support
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-4">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                {/* Linke Seite */}
                <div className="flex-1 space-y-2">
                  <p>Montag – Freitag, 09:00–18:00 Uhr</p>
                  <p className="font-medium">Telefon:</p>
                  <ul className="ml-4 list-disc">
                    <li>Deutsch: +41 (0)22 761 4182</li>
                    <li>Französisch: +41 (0)22 761 4183</li>
                    <li>Italienisch: +39 (0)26 968 2104</li>
                  </ul>

                  <p className="font-medium mt-2">E-Mail:</p>
                  <ul className="ml-4 list-disc">
                    <li>
                      <a href="mailto:dealersupport.ch-de@eu.sony.com" className="text-[#1F3B9B] hover:underline">
                        dealersupport.ch-de@eu.sony.com
                      </a>
                    </li>
                    <li>
                      <a href="mailto:dealersupport.ch-fr@eu.sony.com" className="text-[#1F3B9B] hover:underline">
                        dealersupport.ch-fr@eu.sony.com
                      </a>
                    </li>
                    <li>
                      <a href="mailto:dealersupport.ch-it@eu.sony.com" className="text-[#1F3B9B] hover:underline">
                        dealersupport.ch-it@eu.sony.com
                      </a>
                    </li>
                  </ul>

                  <div className="pt-3 border-t border-gray-200 mt-3">
                    <p className="text-sm text-gray-700">Weitere Hilfe direkt bei Sony:</p>
                    <Link
                      href="https://www.sony.ch/de/electronics/support"
                      target="_blank"
                      className="text-[#1F3B9B] hover:underline"
                    >
                      🔗 Sony Support Schweiz →
                    </Link>
                  </div>
                </div>

                {/* Rechte Seite: Holger */}
                <div className="flex-shrink-0 w-48 text-center bg-gray-50 rounded-xl p-3 border border-gray-200 shadow-sm">
                  <div className="w-24 h-28 mx-auto relative overflow-hidden rounded-lg mb-2 border border-gray-200">
                    <Image
                      src="/contacts/holger_stuckenburg.jpg"
                      alt="Holger Stuckenburg"
                      fill
                      unoptimized
                      className="object-cover object-[center_20%]"

                    />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">Holger Stuckenburg</p>
                  <p className="text-gray-600 text-xs leading-tight">
                    Senior Expert – Service Management<br />
                    DACH Regional LDSM
                  </p>
                  <a href="mailto:Holger.Stuckenburg@sony.com" className="text-[#1F3B9B] text-xs hover:underline">
                    Holger.Stuckenburg@sony.com
                  </a>
                  <p className="text-gray-700 text-xs mt-1">📱 +49 30 4195 53356</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endkunden-Support */}
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition">
            <CardHeader className="pb-2 border-b border-[#1F3B9B]/20">
              <CardTitle className="text-[#1F3B9B] text-base font-semibold flex items-center gap-2">
                🧩 Endkunden-Support
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p>Montag – Freitag, 09:00–18:00 Uhr</p>
              <p className="font-medium">Telefon:</p>
              <ul className="ml-4 list-disc">
                <li>Deutsch: +41 (0)22 761 4182</li>
                <li>Französisch: +41 (0)22 761 4183</li>
                <li>Italienisch: +39 (0)26 968 2104</li>
              </ul>
              <p className="font-medium mt-2">E-Mail:</p>
              <ul className="ml-4 list-disc">
                <li>
                  <a href="mailto:customersupport.ch-de@eu.sony.com" className="text-[#1F3B9B] hover:underline">
                    customersupport.ch-de@eu.sony.com
                  </a>
                </li>
                <li>
                  <a href="mailto:customersupport.ch-fr@eu.sony.com" className="text-[#1F3B9B] hover:underline">
                    customersupport.ch-fr@eu.sony.com
                  </a>
                </li>
                <li>
                  <a href="mailto:customersupport.ch-it@eu.sony.com" className="text-[#1F3B9B] hover:underline">
                    customersupport.ch-it@eu.sony.com
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* === VERKAUF INNENDIENST === */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-[#1F3B9B] flex items-center gap-2 border-b border-[#1F3B9B]/30 pb-1">
          <Users className="w-5 h-5 text-[#1F3B9B]" />
          Verkauf Innendienst
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              name: "Lőrinc Szánthó",
              role: "Commercial Investment Team Lead",
              email: "Lorinc.Szantho@sony.com",
              team: "SBO CI Europe",
              phone: "+41 848 870 878",
              img: "/contacts/szánthó-lőrinc.jpg",
            },
            {
              name: "Julia Szabo",
              role: "Sales Support Senior Specialist",
              email: "Julia.Szabo@sony.com",
              team: "SBOE CI1 – Budapest",
              phone: "+41 848 870 878",
              img: "/contacts/julia_szabo.jpg",
            },
            {
              name: "Réka Luterán",
              role: "European Sales Support Specialist",
              email: "Reka.Luteran@sony.com",
              team: "SBOE CI1 – Budapest",
              phone: "+41 848 870 878",
              img: "/contacts/reka_luterana.jpg",
            },
            {
              name: "Orsolya Panyi",
              role: "Sales Support Specialist",
              email: "panyi.orsolya@sony.com",
              team: "SBOE CI1 – Budapest",
              phone: "+41 848 870 878",
              img: "/contacts/panyi_orsolya.jpg",
            },
          ].map((p) => (
            <Card key={p.email} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition text-center">
              <CardContent className="flex flex-col items-center pt-6 space-y-3">
                <div className="w-36 h-42 relative overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                  <Image src={p.img} alt={p.name} fill unoptimized className="object-cover object-top" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800">{p.name}</p>
                  <p className="text-gray-600 text-sm">{p.role}</p>
                  <p className="text-gray-500 text-xs">{p.team}</p>
                  <a href={`mailto:${p.email}`} className="text-[#1F3B9B] text-sm hover:underline">
                    {p.email}
                  </a>
                  <p className="text-gray-700 text-sm">📱 {p.phone}</p>
                  <p className="text-gray-500 text-xs">E-Mail: sseschatoperations@sony.com</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* === KEY ACCOUNT MANAGER === */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-[#1F3B9B] flex items-center gap-2 border-b border-[#1F3B9B]/30 pb-1">
          <Users className="w-5 h-5 text-[#1F3B9B]" />
          Ansprechpartner Verkauf
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
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
          ].map((p) => (
            <Card key={p.email} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition text-center">
              <CardContent className="flex flex-col items-center pt-6 space-y-3">
                <div className="w-40 h-44 relative overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-gray-50">
                  <Image src={p.img} alt={p.name} fill unoptimized className="object-cover object-top" />
                </div>
                <p className="font-semibold text-gray-800">{p.name}</p>
                <p className="text-gray-600 text-sm">{p.role}</p>
                <a href={`mailto:${p.email}`} className="text-[#1F3B9B] text-sm hover:underline">
                  {p.email}
                </a>
                <p className="text-gray-700 text-sm">📱 {p.phone}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* === DOWNLOADS === */}
      <section>
        <h2 className="text-lg font-semibold mb-3 text-[#1F3B9B] flex items-center gap-2 border-b border-[#1F3B9B]/30 pb-1">
          <FileDown className="w-5 h-5 text-[#1F3B9B]" />
          Downloads
        </h2>

        <div className="space-y-2">
          {[
            { name: "Anmeldung Sertronics", file: "/docs/Anmeldung_Sertronics.pdf" },
            { name: "DOA-Formular", file: "/docs/DOA-Formular.pdf" },
            { name: "DOA-Regelung (DE)", file: "/docs/DOA-Regelung-DE.pdf" },
          ].map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <FileDown className="w-4 h-4 text-[#1F3B9B]" />
              <Link href={d.file} target="_blank" className="text-[#1F3B9B] hover:underline">
                {d.name}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
