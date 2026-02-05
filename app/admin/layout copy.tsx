"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ReactNode,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";

import I18nProvider, { useI18n } from "@/lib/i18n/I18nProvider";
import { createClient } from "@/utils/supabase/client";

import { Globe, LogOut, UserRound, Search } from "lucide-react";

import PendingIndicator from "@/components/admin/PendingIndicator";
import MiniBadge from "@/components/admin/MiniBadge";

/* ------------------------------------------------------------------
   TYPES
------------------------------------------------------------------ */

type PendingKey =
  | "promotions"
  | "sofortrabatt"
  | "projekts"
  | "bestellungen"
  | "support"
  | "aktionen"
  | "cashback";

/* ------------------------------------------------------------------
   HILFSFUNKTIONEN
------------------------------------------------------------------ */

// Zufallspasswort generieren (C4)
function generateRandomPassword(length: number = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@$%&*?";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

/* ------------------------------------------------------------------
   INNER LAYOUT
------------------------------------------------------------------ */

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useI18n();

  const [openLang, setOpenLang] = useState(false);
  const [dealers, setDealers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const langRef = useRef<HTMLDivElement | null>(null);

  const [pendingCounts, setPendingCounts] = useState<Record<PendingKey, number>>({
    promotions: 0,
    sofortrabatt: 0,
    projekts: 0,
    bestellungen: 0,
    support: 0,
    aktionen: 0,
    cashback: 0,
  });

  // -------------------------------------------------------------------
  // STATE: Aktueller Admin (für Logging etc.)
  // -------------------------------------------------------------------
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string | null>(null);
  const [currentAdminLogin, setCurrentAdminLogin] = useState<string | null>(null);

  // -------------------------------------------------------------------
  // STATE: Login / Passwort ändern Modal
  // -------------------------------------------------------------------
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalLogin, setModalLogin] = useState("");
  const [modalNewLogin, setModalNewLogin] = useState("");
  const [modalNewPassword, setModalNewPassword] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Toast für globale Meldungen (D3)
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // -------------------------------------------------------------------
  // Admin-User aus Supabase holen (für Logging + Komfort)
  // -------------------------------------------------------------------
  useEffect(() => {
    const loadAdmin = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.email) return;

      const email = data.user.email;
      setCurrentAdminEmail(email);

      // Falls Schema: LOGIN@p5.local -> Login extrahieren
      if (email.endsWith("@p5.local")) {
        const login = email.replace("@p5.local", "");
        setCurrentAdminLogin(login);
      }
    };
    loadAdmin();
  }, [supabase]);

  const openUserModal = () => {
    // Standardmäßig mit aktuellem Admin-Login vorbefüllen (kann überschrieben werden)
    setModalLogin(currentAdminLogin || "");
    setModalNewLogin("");
    setModalNewPassword("");
    setModalError(null);
    setModalSuccess(null);
    setShowPassword(false);
    setIsUserModalOpen(true);
  };

  const closeUserModal = () => {
    if (modalLoading) return;
    setIsUserModalOpen(false);
  };

  const handleUserUpdate = async () => {
    setModalError(null);
    setModalSuccess(null);

    const loginTrimmed = modalLogin.trim();
    const newLoginTrimmed = modalNewLogin.trim();
    const newPasswordTrimmed = modalNewPassword.trim();

    if (!loginTrimmed) {
      const msg = "Login / LoginNr ist erforderlich.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    if (!newPasswordTrimmed || newPasswordTrimmed.length < 6) {
      const msg = "Das neue Passwort muss mindestens 6 Zeichen haben.";
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    // A4: Neuer Login – nur bestimmte Zeichen zulassen
    if (newLoginTrimmed) {
      const loginRegex = /^[A-Za-z0-9_-]+$/;
      if (!loginRegex.test(newLoginTrimmed)) {
        const msg =
          "Neuer Login darf nur Buchstaben, Zahlen, '-' und '_' enthalten.";
        setModalError(msg);
        showToast("error", msg);
        return;
      }
    }

    const finalNewLogin = newLoginTrimmed || loginTrimmed;

    // A5: Warnung, wenn Login gleich bleibt (nur Hinweis, kein Blocker)
    const loginChanged = finalNewLogin !== loginTrimmed;

    // A2: Confirm-Dialog bei Login-Änderung
    if (loginChanged) {
      const confirmed = window.confirm(
        `Sie ändern den Login von "${loginTrimmed}" auf "${finalNewLogin}". Fortfahren?`
      );
      if (!confirmed) {
        return;
      }
    }

    const payload = {
      oldLogin: loginTrimmed,
      newLogin: finalNewLogin,
      newPassword: newPasswordTrimmed,
      performedBy: currentAdminEmail || currentAdminLogin || "admin-unknown",
    };

    try {
      setModalLoading(true);
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data.error || "Unbekannter Fehler bei der Aktualisierung.";
        setModalError(msg);
        showToast("error", msg);
        return;
      }

      const successMsg = loginChanged
        ? "Login und Passwort erfolgreich aktualisiert."
        : "Passwort erfolgreich aktualisiert (Login unverändert).";

      setModalSuccess(successMsg);
      showToast("success", successMsg);
    } catch (err: any) {
      const msg = "Fehler beim Senden der Anfrage.";
      setModalError(msg);
      showToast("error", msg);
    } finally {
      setModalLoading(false);
    }
  };

  const handleGeneratePassword = async () => {
    const pwd = generateRandomPassword(12);
    setModalNewPassword(pwd);

    // Optional: direkt in Zwischenablage kopieren
    try {
      if (navigator && "clipboard" in navigator) {
        await navigator.clipboard.writeText(pwd);
        showToast("success", "Zufallspasswort generiert und kopiert.");
      } else {
        showToast("success", "Zufallspasswort generiert.");
      }
    } catch {
      showToast("success", "Zufallspasswort generiert.");
    }
  };

  const handleFillAdminLogin = () => {
    if (currentAdminLogin) {
      setModalLogin(currentAdminLogin);
    }
  };

  /* ------------------------------------------------------------------
     CLICK OUTSIDE LANGUAGE DROPDOWN
  ------------------------------------------------------------------ */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setOpenLang(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ------------------------------------------------------------------
     LOAD DEALERS
  ------------------------------------------------------------------ */
  useEffect(() => {
    const loadDealers = async () => {
      const { data } = await supabase
        .from("dealers")
        .select("dealer_id, name, email, login_nr")
        .order("name", { ascending: true });

      if (data) setDealers(data);
    };
    loadDealers();
  }, [supabase]);

  /* ------------------------------------------------------------------
     LOAD PENDING COUNTS (INLINE FUNCTION)
  ------------------------------------------------------------------ */
  const loadPendingCounts = async () => {
    const counts: Record<PendingKey, number> = {
      promotions: 0,
      sofortrabatt: 0,
      projekts: 0,
      bestellungen: 0,
      support: 0,
      aktionen: 0,
      cashback: 0,
    };

    // 1) Submissions laden
    const { data: submissions } = await supabase
      .from("submissions")
      .select("typ, status");

    if (submissions) {
      submissions.forEach((row: any) => {
        if (row.status === "pending") {
          if (row.typ === "promotion") counts.promotions++;
          if (row.typ === "projekt") counts.projekts++;
          if (row.typ === "bestellung") counts.bestellungen++;
          if (row.typ === "support") counts.support++;
          if (row.typ === "monatsaktion") counts.aktionen++;
          if (row.typ === "cashback") counts.cashback++;
        }
      });
    }

    // 2) Sofortrabatt separat laden (eigene Tabelle!)
    const { data: sofortrabattClaims } = await supabase
      .from("sofortrabatt_claims")
      .select("status");

    if (sofortrabattClaims) {
      sofortrabattClaims.forEach((row: any) => {
        if (row.status === "pending") {
          counts.sofortrabatt++;
        }
      });
    }

    setPendingCounts(counts);
  };

  /* ------------------------------------------------------------------
     INITIAL LOAD
  ------------------------------------------------------------------ */
  useEffect(() => {
    loadPendingCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------------
     REALTIME LISTENER FOR LIVE UPDATES
  ------------------------------------------------------------------ */
  useEffect(() => {
    const channel = supabase
      .channel("pending_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => {
          // Anytime something changes → reload counters
          loadPendingCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  /* ------------------------------------------------------------------
     FILTER DEALERS
  ------------------------------------------------------------------ */
  const filteredDealers = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return dealers.filter((d) => {
      const name = d.name?.toLowerCase() || "";
      const email = d.email?.toLowerCase() || "";
      return name.includes(lower) || email.includes(lower);
    });
  }, [dealers, searchTerm]);

  /* ------------------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------------------ */
  const navItems: {
    href: string;
    key: PendingKey | null;
    label: string;
    color: string;
  }[] = [
    { href: "/admin/promotions", key: "promotions", label: t("admin.promotions"), color: "text-blue-600" },
    { href: "/admin/sofortrabatt", key: "sofortrabatt", label: t("admin.instantDiscount"), color: "text-pink-600" },
    { href: "/admin/projekte", key: "projekts", label: t("admin.projects"), color: "text-indigo-600" },
    { href: "/admin/bestellungen", key: "bestellungen", label: t("admin.orders"), color: "text-green-600" },
    { href: "/admin/support", key: "support", label: t("admin.support"), color: "text-orange-600" },
    { href: "/admin/aktionen", key: "aktionen", label: t("admin.monthlyOffers"), color: "text-teal-600" },
    { href: "/admin/reports", key: null, label: t("admin.reports"), color: "text-gray-600" },
    { href: "/admin/infos", key: null, label: t("admin.info"), color: "text-gray-500" },
  ];

  const activeColor = useMemo(() => {
    const m = navItems.find((item) => pathname.startsWith(item.href));
    return m ? m.color : "text-gray-800";
  }, [pathname, navItems]);

  /* ------------------------------------------------------------------
     IMPERSONATE DEALER
  ------------------------------------------------------------------ */
  const handleImpersonate = (dealerId: string) => {
    if (!dealerId) return;
    window.open(`/bestellung?dealer_id=${dealerId}`, "_blank");
  };

  /* ------------------------------------------------------------------
     LOGOUT
  ------------------------------------------------------------------ */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  /* ------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* HEADER */}
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 border-b">
        <div className="flex justify-between items-center px-6 py-3">
          {/* LOGO */}
          <Link
            href="/dashboard"
            className="font-semibold text-gray-800 text-lg flex items-center gap-0"
          >
            <span className="text-black">P</span>
            <span className={`${activeColor} transition-colors`}>5</span>
            <span className="text-black">connect Admin Dashboard</span>
          </Link>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-5">
            {/* GLOBAL BADGE MENU */}
            <PendingIndicator />

            {/* IMPERSONATION */}
            <div className="relative flex items-center gap-2">
              <UserRound className="w-5 h-5 text-blue-600" />

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Händler suchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-blue-200 bg-blue-50 text-blue-800 rounded-md w-52 outline-none"
                />
              </div>

              <select
                onChange={(e) => handleImpersonate(e.target.value)}
                className="border border-blue-200 bg-blue-50 text-blue-800 text-sm rounded-md px-2 py-1.5 w-52"
              >
                <option value="">{t("admin.actAsDealer")}</option>
                {filteredDealers.map((d) => (
                  <option key={d.dealer_id} value={d.dealer_id}>
                    {d.name} ({d.email})
                  </option>
                ))}
              </select>
            </div>

            {/* BUTTON: LOGIN / PASSWORT ÄNDERN */}
            <button
              onClick={openUserModal}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1"
            >
              🔐 Login / Passwort
            </button>

            {/* LANGUAGE SWITCH */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setOpenLang((o) => !o)}
                className="flex items-center gap-1 text-sm text-gray-800 hover:text-black"
              >
                <Globe className="w-4 h-4" />
                {lang === "de"
                  ? "Deutsch"
                  : lang === "fr"
                  ? "Français"
                  : lang === "it"
                  ? "Italiano"
                  : lang === "rm"
                  ? "Rumantsch"
                  : "English"}
              </button>

              {openLang && (
                <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-md z-50">
                  {["de", "en", "fr", "it", "rm"].map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l as any);
                        setOpenLang(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        l === lang
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {l === "de"
                        ? "Deutsch"
                        : l === "fr"
                        ? "Français"
                        : l === "it"
                        ? "Italiano"
                        : l === "rm"
                        ? "Rumantsch"
                        : "English"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* LOGOUT */}
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex gap-6 px-6 py-2 bg-white border-t shadow-sm overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const count = item.key ? pendingCounts[item.key as PendingKey] : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? `${item.color} font-semibold border-b-2 border-current pb-1`
                    : "text-gray-700 hover:text-black"
                }`}
              >
                {item.label}
                <MiniBadge count={count} />
              </Link>
            );
          })}
        </nav>
      </header>

      {/* CONTENT */}
      <main className="flex-1 p-6 pt-28">{children}</main>

      {/* MODAL: LOGIN / PASSWORT ÄNDERN */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all duration-200 scale-100 opacity-100">
            <h2 className="text-lg font-semibold mb-4">
              Login / Passwort ändern
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktueller Login / LoginNr *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={modalLogin}
                    onChange={(e) => setModalLogin(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="z.B. VAdminP5 oder Händler-LoginNr"
                  />
                  <button
                    type="button"
                    onClick={handleFillAdminLogin}
                    className="px-2 py-1 text-xs border rounded text-gray-600 hover:bg-gray-50"
                  >
                    Mein Login
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Neuer Login (optional)
                </label>
                <input
                  type="text"
                  value={modalNewLogin}
                  onChange={(e) => setModalNewLogin(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leer lassen, wenn Login gleich bleiben soll"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Erlaubt: Buchstaben, Zahlen, „-“, „_“.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Neues Passwort *
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={modalNewPassword}
                    onChange={(e) => setModalNewPassword(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Mindestens 6 Zeichen"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="px-2 py-1 text-xs border rounded text-gray-600 hover:bg-gray-50"
                  >
                    {showPassword ? "Verbergen" : "Anzeigen"}
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-2 py-1 text-xs border rounded text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    Zufallspasswort erzeugen
                  </button>
                </div>
              </div>

              {modalError && (
                <p className="text-sm text-red-600 mt-1">{modalError}</p>
              )}
              {modalSuccess && (
                <p className="text-sm text-green-600 mt-1">{modalSuccess}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeUserModal}
                disabled={modalLoading}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUserUpdate}
                disabled={modalLoading}
                className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {modalLoading ? "Speichere..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed top-4 right-4 z-[60]">
          <div
            className={`px-4 py-2 rounded shadow-md text-sm text-white ${
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   WRAPPER
------------------------------------------------------------------ */

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </I18nProvider>
  );
}
