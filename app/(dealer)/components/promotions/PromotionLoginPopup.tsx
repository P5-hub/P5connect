"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Lang } from "@/lib/i18n/translations";

const LOGIN_POPUP_FLAG = "p5_show_promo_popup";

type PromotionPopupResponse = {
  success?: boolean;
  promo_id?: string;
  lang?: string;
  image_url?: string;
  error?: string;
};

const SUPPORTED_LANGS: Lang[] = ["de", "en", "fr", "it", "rm"];

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function getStoredLang(fallback: Lang): Lang {
  if (typeof window === "undefined") return fallback;

  const localStorageLang = localStorage.getItem("lang");
  const cookieLang = getCookie("lang");

  const detectedLang = (localStorageLang || cookieLang || fallback || "de")
    .slice(0, 2)
    .toLowerCase();

  return SUPPORTED_LANGS.includes(detectedLang as Lang)
    ? (detectedLang as Lang)
    : "de";
}

export default function PromotionLoginPopup() {
  const { lang, t } = useI18n();

  const hasCheckedRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hasCheckedRef.current) return;

    hasCheckedRef.current = true;

  const params = new URLSearchParams(window.location.search);
  const forcePreview = params.get("promo") === "1";

  const shouldShow =
    sessionStorage.getItem(LOGIN_POPUP_FLAG) === "1" || forcePreview;

  if (!shouldShow) return;

  if (!forcePreview) {
    sessionStorage.removeItem(LOGIN_POPUP_FLAG);
  }

    const popupLang = getStoredLang(lang);

    const loadPromotionImage = async () => {
      try {
        const res = await fetch(
          `/api/promotions/login-popup?lang=${encodeURIComponent(popupLang)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const contentType = res.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await res.text();

          console.error("Promotion API returned non-JSON:", {
            status: res.status,
            contentType,
            bodyStart: text.slice(0, 200),
          });

          return;
        }

        const json = (await res.json()) as PromotionPopupResponse;

        console.log("PROMO POPUP IMAGE", {
          requestedLang: popupLang,
          apiLang: json.lang,
          imageUrl: json.image_url,
        });

        if (!res.ok || !json.image_url) {
          console.warn("Promotion popup image not available:", json);
          return;
        }

        setImageUrl(json.image_url);
        setOpen(true);
      } catch (err) {
        console.error("Promotion popup konnte nicht geladen werden:", err);
      }
    };

    loadPromotionImage();
  }, [lang]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/75 px-3 py-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-[96vw] max-w-[1500px] overflow-hidden rounded-3xl bg-slate-950 shadow-2xl ring-1 ring-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("bestellung.common.close")}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-white shadow-lg ring-1 ring-white/20 transition hover:bg-white hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        <img
          src={imageUrl}
          alt="BRAVIA Cool Summer Deals"
          className="block w-full max-h-[82vh] object-contain"
        />

        <div className="flex items-center justify-end gap-3 border-t border-white/10 bg-black px-5 py-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black"
          >
            {t("bestellung.common.close")}
          </button>
        </div>
      </div>
    </div>
  );
}