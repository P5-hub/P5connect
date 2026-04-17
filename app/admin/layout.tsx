"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useMemo, useState, useEffect, useRef } from "react";

import I18nProvider, { useI18n } from "@/lib/i18n/I18nProvider";
import type { Lang } from "@/lib/i18n/translations";
import { createClient } from "@/utils/supabase/client";

import {
  Globe,
  LogOut,
  UserRound,
  Search,
  Menu,
  X,
  Bell,
} from "lucide-react";

import PendingIndicator from "@/components/admin/PendingIndicator";
import MiniBadge from "@/components/admin/MiniBadge";

type PendingKey =
  | "promotions"
  | "sofortrabatt"
  | "projekts"
  | "bestellungen"
  | "support"
  | "aktionen"
  | "cashback";

type DealerListItem = {
  dealer_id: number | string;
  name?: string | null;
  email?: string | null;
  login_nr?: string | null;
};

type UpdateUserApiResponse = {
  success?: boolean;
  error?: string;
  changedOwnAccount?: boolean;
};

type CreateAdminApiResponse = {
  success?: boolean;
  error?: string;
  message?: string;
  dealer_id?: number;
  email?: string;
  auth_user_id?: string;
};

function generateRandomPassword(length: number = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@$%&*?";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pwd;
}

function getLanguageLabel(lang: Lang) {
  switch (lang) {
    case "de":
      return "Deutsch";
    case "en":
      return "English";
    case "fr":
      return "Français";
    case "it":
      return "Italiano";
    case "rm":
      return "Rumantsch";
    default:
      return "English";
  }
}

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { t, lang, setLang } = useI18n();

  const [openLang, setOpenLang] = useState(false);
  const [dealers, setDealers] = useState<DealerListItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDealerId, setSelectedDealerId] = useState<string>("");

  const langRef = useRef<HTMLDivElement | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [pendingCounts, setPendingCounts] = useState<Record<PendingKey, number>>(
    {
      promotions: 0,
      sofortrabatt: 0,
      projekts: 0,
      bestellungen: 0,
      support: 0,
      aktionen: 0,
      cashback: 0,
    }
  );

    
  const [currentAdminEmail, setCurrentAdminEmail] = useState<string | null>(
    null
  );
  const [currentAdminLogin, setCurrentAdminLogin] = useState<string | null>(
    null
  );
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [modalLogin, setModalLogin] = useState("");
  const [modalNewLogin, setModalNewLogin] = useState("");
  const [modalNewPassword, setModalNewPassword] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [createAdminEmail, setCreateAdminEmail] = useState("");
  const [createAdminDealerId, setCreateAdminDealerId] = useState("");
  const [createAdminPassword, setCreateAdminPassword] = useState("");
  const [createAdminLoading, setCreateAdminLoading] = useState(false);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);
  const [createAdminSuccess, setCreateAdminSuccess] = useState<string | null>(
    null
  );

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const loadAdmin = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.email) return;

      const email = data.user.email;
      setCurrentAdminEmail(email);
      setCurrentRole(data.user.app_metadata?.role ?? null);

      if (email.endsWith("@p5.local")) {
        const login = email.replace("@p5.local", "");
        setCurrentAdminLogin(login);
      }
    };

    loadAdmin();
  }, [supabase]);

  const openUserModal = () => {
    setModalLogin(currentAdminLogin || "");
    setModalNewLogin("");
    setModalNewPassword("");
    setModalError(null);
    setModalSuccess(null);
    setShowPassword(false);
    setIsUserModalOpen(true);
    setMobileMenuOpen(false);
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
      const msg = t("adminAccount.loginRequired");
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    if (!newPasswordTrimmed || newPasswordTrimmed.length < 6) {
      const msg = t("adminAccount.passwordMinLength");
      setModalError(msg);
      showToast("error", msg);
      return;
    }

    if (newLoginTrimmed) {
      const loginRegex = /^[A-Za-z0-9_-]+$/;
      if (!loginRegex.test(newLoginTrimmed)) {
        const msg = t("adminAccount.invalidLoginFormat");
        setModalError(msg);
        showToast("error", msg);
        return;
      }
    }

    const finalNewLogin = newLoginTrimmed || loginTrimmed;
    const loginChanged = finalNewLogin !== loginTrimmed;
    const passwordChanged = newPasswordTrimmed.length > 0;

    if (loginChanged || passwordChanged) {
      let confirmText = t("adminAccount.confirmTitle");

      if (loginChanged && passwordChanged) {
        confirmText = t("adminAccount.confirmLoginAndPasswordChange", {
          old: loginTrimmed,
          new: finalNewLogin,
        });
      } else if (loginChanged) {
        confirmText = t("adminAccount.confirmLoginChange", {
          old: loginTrimmed,
          new: finalNewLogin,
        });
      } else if (passwordChanged) {
        confirmText = t("adminAccount.confirmPasswordChange");
      }

      const confirmed = window.confirm(confirmText);
      if (!confirmed) return;
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

      const data = (await res.json()) as UpdateUserApiResponse;

      if (!res.ok || !data.success) {
        const msg = data.error || t("adminAccount.updateFailed");
        setModalError(msg);
        showToast("error", msg);
        return;
      }

      const changedOwnAccount = Boolean(data?.changedOwnAccount);

      let successMsg = t("adminAccount.successDefault");
      if (loginChanged && passwordChanged) {
        successMsg = t("adminAccount.successLoginAndPassword");
      } else if (loginChanged) {
        successMsg = t("adminAccount.successLogin");
      } else if (passwordChanged) {
        successMsg = t("adminAccount.successPassword");
      }

      setModalLogin(finalNewLogin);
      setModalNewLogin("");
      setModalNewPassword("");
      setShowPassword(false);

      if (changedOwnAccount) {
        const fullMsg = `${successMsg} ${t("adminAccount.reloginNow")}`;
        setModalSuccess(fullMsg);
        showToast("success", fullMsg);

        await new Promise((resolve) => setTimeout(resolve, 1600));

        setIsUserModalOpen(false);
        await supabase.auth.signOut();
        window.location.href = "/login";
        return;
      }

      setModalSuccess(successMsg);
      showToast("success", successMsg);

      setTimeout(() => {
        setIsUserModalOpen(false);
        setModalSuccess(null);
      }, 1000);
    } catch {
      const msg = t("adminAccount.requestFailed");
      setModalError(msg);
      showToast("error", msg);
    } finally {
      setModalLoading(false);
    }
  };
  
  const handleGeneratePassword = async () => {
    const pwd = generateRandomPassword(12);
    setModalNewPassword(pwd);

    try {
      if (navigator && "clipboard" in navigator) {
        await navigator.clipboard.writeText(pwd);
        showToast("success", t("adminAccount.passwordGeneratedCopied"));
      } else {
        showToast("success", t("adminAccount.passwordGenerated"));
      }
    } catch {
      showToast("success", t("adminAccount.passwordGenerated"));
    }
  };

  const handleFillAdminLogin = () => {
    if (currentAdminLogin) setModalLogin(currentAdminLogin);
  };

  const openCreateAdminModal = () => {
    setCreateAdminEmail("");
    setCreateAdminDealerId("");
    setCreateAdminPassword("");
    setCreateAdminError(null);
    setCreateAdminSuccess(null);
    setIsCreateAdminModalOpen(true);
    setMobileMenuOpen(false);
  };

  const closeCreateAdminModal = () => {
    if (createAdminLoading) return;
    setIsCreateAdminModalOpen(false);
  };

  const handleCreateAdmin = async () => {
    setCreateAdminError(null);
    setCreateAdminSuccess(null);

    const email = createAdminEmail.trim().toLowerCase();
    const dealer_id = Number(createAdminDealerId);

    if (!email) {
      const msg = "Bitte E-Mail eingeben.";
      setCreateAdminError(msg);
      showToast("error", msg);
      return;
    }

    if (!dealer_id || Number.isNaN(dealer_id)) {
      const msg = "Ungültige Dealer ID.";
      setCreateAdminError(msg);
      showToast("error", msg);
      return;
    }

    try {
      setCreateAdminLoading(true);

      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          dealer_id,
          password: createAdminPassword.trim() || undefined,
        }),
      });

      const data = (await res.json()) as CreateAdminApiResponse;

      if (!res.ok) {
        const msg = data?.error || "Admin konnte nicht erstellt werden.";
        setCreateAdminError(msg);
        showToast("error", msg);
        return;
      }

      const msg = data?.message || "Admin erfolgreich erstellt.";
      setCreateAdminSuccess(msg);
      showToast("success", msg);

      setCreateAdminEmail("");
      setCreateAdminDealerId("");
      setCreateAdminPassword("");
    } catch {
      const msg = "Serverfehler beim Erstellen.";
      setCreateAdminError(msg);
      showToast("error", msg);
    } finally {
      setCreateAdminLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setOpenLang(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const loadDealers = async () => {
      const { data } = await supabase
        .from("dealers")
        .select("dealer_id, name, email, login_nr")
        .order("name", { ascending: true });

      if (data) {
        setDealers(data as DealerListItem[]);
      }
    };

    loadDealers();
  }, [supabase]);

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

    const { data: submissions } = await supabase
      .from("submissions")
      .select("typ, status");

    if (submissions) {
      submissions.forEach((row: any) => {
        if (row.status !== "pending") return;
        if (row.typ === "promotion") counts.promotions++;
        if (row.typ === "projekt") counts.projekts++;
        if (row.typ === "bestellung") counts.bestellungen++;
        if (row.typ === "support") counts.support++;
        if (row.typ === "monatsaktion") counts.aktionen++;
        if (row.typ === "cashback") counts.cashback++;
      });
    }

    const { data: sofortrabattClaims } = await supabase
      .from("sofortrabatt_claims")
      .select("status");

    if (sofortrabattClaims) {
      sofortrabattClaims.forEach((row: any) => {
        if (row.status === "pending") counts.sofortrabatt++;
      });
    }

    setPendingCounts(counts);
  };

  useEffect(() => {
    loadPendingCounts();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("pending_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions" },
        () => loadPendingCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const filteredDealers = useMemo(() => {
    const lower = searchTerm.toLowerCase();

    return dealers.filter((d) => {
      const name = d.name?.toLowerCase() || "";
      const email = d.email?.toLowerCase() || "";
      const login = d.login_nr?.toLowerCase?.() || "";

      return (
        name.includes(lower) ||
        email.includes(lower) ||
        login.includes(lower)
      );
    });
  }, [dealers, searchTerm]);

  const navItems: {
    href: string;
    key: PendingKey | null;
    label: string;
    color: string;
  }[] = [
    {
      href: "/admin/promotions",
      key: "promotions",
      label: t("adminCommon.promotions"),
      color: "text-blue-600",
    },
    {
      href: "/admin/sofortrabatt",
      key: "sofortrabatt",
      label: t("adminCommon.instantDiscount"),
      color: "text-pink-600",
    },
    {
      href: "/admin/projekte",
      key: "projekts",
      label: t("adminCommon.projects"),
      color: "text-indigo-600",
    },
    {
      href: "/admin/bestellungen",
      key: "bestellungen",
      label: t("adminCommon.orders"),
      color: "text-green-600",
    },
    {
      href: "/admin/support",
      key: "support",
      label: t("adminCommon.support"),
      color: "text-orange-600",
    },
    {
      href: "/admin/aktionen",
      key: "aktionen",
      label: t("adminCommon.monthlyOffers"),
      color: "text-teal-600",
    },
    {
      href: "/admin/reports",
      key: null,
      label: t("adminCommon.reports"),
      color: "text-gray-600",
    },
    {
      href: "/admin/infos",
      key: null,
      label: t("adminCommon.info"),
      color: "text-gray-500",
    },
  ];

  const activeColor = useMemo(() => {
    const match = navItems.find((item) => pathname.startsWith(item.href));
    return match ? match.color : "text-gray-800";
  }, [pathname, navItems]);

  const handleImpersonate = async (dealerId: string) => {
    if (!dealerId) {
      showToast("error", "Bitte zuerst einen Händler auswählen.");
      return;
    }

    try {
      const res = await fetch("/api/acting-as/set", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dealer_id: Number(dealerId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(
          "error",
          data?.error || "Händlermodus konnte nicht gestartet werden."
        );
        return;
      }

      window.open("/bestellung", "_blank");
      setMobileMenuOpen(false);
    } catch {
      showToast("error", "Händlermodus konnte nicht gestartet werden.");
    }
  };

  const handleOpenDealerCrm = () => {
    if (!selectedDealerId) {
      showToast("error", "Bitte zuerst einen Händler auswählen.");
      return;
    }

    router.push(`/admin/dealers/${selectedDealerId}`);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const langLabel = getLanguageLabel(lang);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 border-b">
        <div className="flex justify-between items-center px-3 md:px-6 py-2 md:py-3">
          <Link
            href="/dashboard"
            className="font-semibold text-gray-800 text-base md:text-lg flex items-center gap-0"
          >
            <span className="text-black">P</span>
            <span className={`${activeColor} transition-colors`}>5</span>
            <span className="text-black hidden sm:inline">
              {t("nav.dashboard")}
            </span>
            <span className="text-black sm:hidden">
              {t("nav.dashboardTitle")}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-5">
            <PendingIndicator />

            <div className="relative flex items-center gap-2">
              <UserRound className="w-5 h-5 text-blue-600" />

              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t("adminCommon.common.searchDealer")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm border border-blue-200 bg-blue-50 text-blue-800 rounded-md w-52 outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  onChange={(e) => setSelectedDealerId(e.target.value)}
                  className="border border-blue-200 bg-blue-50 text-blue-800 text-sm rounded-md px-2 py-1.5 w-52"
                  value={selectedDealerId}
                >
                  <option value="">{t("adminCommon.actAsDealer")}</option>
                  {filteredDealers.map((d) => (
                    <option key={d.dealer_id} value={String(d.dealer_id)}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => handleImpersonate(selectedDealerId)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded whitespace-nowrap"
                >
                  Als Händler öffnen
                </button>

                <button
                  type="button"
                  onClick={handleOpenDealerCrm}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded whitespace-nowrap"
                >
                  Händlerakte
                </button>
              </div>
            </div>

            {currentRole === "superadmin" && (
              <button
                onClick={openCreateAdminModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1"
              >
                Admin anlegen
              </button>
            )}

            <button
              onClick={openUserModal}
              className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1"
            >
              {t("adminAccount.button")}
            </button>

            <div className="relative" ref={langRef}>
              <button
                onClick={() => setOpenLang((o) => !o)}
                className="flex items-center gap-1 text-sm text-gray-800 hover:text-black"
              >
                <Globe className="w-4 h-4" />
                {langLabel}
              </button>

              {openLang && (
                <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-md z-50">
                  {(["de", "en", "fr", "it", "rm"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setOpenLang(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${
                        l === lang
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {getLanguageLabel(l)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1.5 rounded flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              {t("adminCommon.common.logout")}
            </button>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label={t("adminCommon.common.open")}
              title={t("adminCommon.common.open")}
            >
              <Bell className="w-5 h-5 text-gray-700" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label={t("adminCommon.common.open")}
              title={t("adminCommon.common.open")}
            >
              <Menu className="w-5 h-5 text-gray-800" />
            </button>
          </div>
        </div>

        <nav className="hidden md:flex gap-6 px-6 py-2 bg-white border-t shadow-sm overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const count = item.key ? pendingCounts[item.key] : 0;

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

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-semibold text-gray-900">
                {t("adminCommon.common.adminMenu")}
              </div>
              <button
                className="p-2 rounded hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
                aria-label={t("adminCommon.common.close")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto">
              <div className="rounded border bg-gray-50 p-3">
                <div className="text-sm font-medium text-gray-800 mb-2">
                  {t("adminCommon.common.pendingItems")}
                </div>
                <PendingIndicator />
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-blue-600" />
                  {t("adminCommon.actAsDealer")}
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t("adminCommon.common.searchDealer")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-blue-200 bg-blue-50 text-blue-800 rounded-md outline-none"
                  />
                </div>

                <select
                  onChange={(e) => setSelectedDealerId(e.target.value)}
                  className="w-full border border-blue-200 bg-blue-50 text-blue-800 text-sm rounded-md px-2 py-2"
                  value={selectedDealerId}
                >
                  <option value="">{t("adminCommon.actAsDealer")}</option>
                  {filteredDealers.map((d) => (
                    <option key={d.dealer_id} value={String(d.dealer_id)}>
                      {d.name} ({d.email})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => handleImpersonate(selectedDealerId)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
                  >
                    Als Händler öffnen
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenDealerCrm}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded"
                  >
                    Händlerakte öffnen
                  </button>
                </div>
              </div>

              {currentRole === "superadmin" && (
                <button
                  onClick={openCreateAdminModal}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-2 rounded flex items-center justify-center gap-2"
                >
                  Admin anlegen
                </button>
              )}

              <button
                onClick={openUserModal}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded flex items-center justify-center gap-2"
              >
                {t("adminAccount.button")}
              </button>

              <div className="rounded border p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-800 mb-2">
                  <Globe className="w-4 h-4" />
                  {t("adminCommon.common.language")}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["de", "en", "fr", "it", "rm"] as Lang[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`px-3 py-2 rounded text-sm border ${
                        l === lang
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {getLanguageLabel(l)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded border p-3">
                <div className="text-sm font-medium text-gray-800 mb-2">
                  {t("adminCommon.common.navigation")}
                </div>
                <div className="flex flex-col gap-1">
                  {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const count = item.key ? pendingCounts[item.key] : 0;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded text-sm ${
                          isActive
                            ? "bg-gray-900 text-white"
                            : "hover:bg-gray-50 text-gray-800"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{item.label}</span>
                        </span>
                        <MiniBadge count={count} />
                      </Link>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                {t("adminCommon.common.logout")}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-3 md:p-6 pt-16 md:pt-28">{children}</main>

      {isUserModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">
              {t("adminAccount.modalTitle")}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("adminAccount.currentLogin")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={modalLogin}
                    onChange={(e) => setModalLogin(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("adminAccount.currentLoginPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={handleFillAdminLogin}
                    className="px-2 py-1 text-xs border rounded text-gray-600 hover:bg-gray-50"
                  >
                    {t("adminCommon.common.myLogin")}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("adminAccount.newLogin")}
                </label>
                <input
                  type="text"
                  value={modalNewLogin}
                  onChange={(e) => setModalNewLogin(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("adminAccount.newLoginPlaceholder")}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t("adminAccount.newLoginHint")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("adminAccount.newPassword")}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={modalNewPassword}
                    onChange={(e) => setModalNewPassword(e.target.value)}
                    className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t("adminAccount.newPasswordPlaceholder")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="px-2 py-1 text-xs border rounded text-gray-600 hover:bg-gray-50"
                  >
                    {showPassword
                      ? t("adminCommon.common.hide")
                      : t("adminCommon.common.show")}
                  </button>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-2 py-1 text-xs border rounded text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    {t("adminAccount.generatePassword")}
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
                {t("adminCommon.common.cancel")}
              </button>
              <button
                onClick={handleUserUpdate}
                disabled={modalLoading}
                className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {modalLoading
                  ? t("adminCommon.common.loading")
                  : t("adminCommon.common.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreateAdminModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-3">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Neuen Admin anlegen</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail
                </label>
                <input
                  type="email"
                  value={createAdminEmail}
                  onChange={(e) => setCreateAdminEmail(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@firma.ch"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dealer ID
                </label>
                <input
                  type="number"
                  value={createAdminDealerId}
                  onChange={(e) => setCreateAdminDealerId(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="z. B. 565"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort (optional)
                </label>
                <input
                  type="password"
                  value={createAdminPassword}
                  onChange={(e) => setCreateAdminPassword(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="nur bei neuem User nötig"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Wenn der User bereits in Supabase Auth existiert, kann das Feld leer bleiben.
                </p>
              </div>

              {createAdminError && (
                <p className="text-sm text-red-600">{createAdminError}</p>
              )}
              {createAdminSuccess && (
                <p className="text-sm text-green-600">{createAdminSuccess}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeCreateAdminModal}
                disabled={createAdminLoading}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Abbrechen
              </button>

              <button
                onClick={handleCreateAdmin}
                disabled={createAdminLoading}
                className="px-3 py-1.5 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {createAdminLoading ? "Erstelle..." : "Admin erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-4 right-4 z-[90]">
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </I18nProvider>
  );
}