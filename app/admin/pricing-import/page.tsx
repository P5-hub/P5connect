"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Upload,
    FileSpreadsheet,
    AlertTriangle,
    PlayCircle,
    Database,
    Download,
} from "lucide-react";
import * as XLSX from "xlsx";
import { createClient } from "@/utils/supabase/client";

type ImportMode = "standard" | "campaign";

type PricingGroup = {
    pricing_group_id: number;
    code: string;
    name: string;
};

type Campaign = {
    campaign_id: number;
    code: string | null;
    name: string;
};

type PreviewRow = {
    rowNumber: number;
    ean: string | null;
    sony_article: string | null;
    product_name: string | null;

    dealer_invoice_price?: number | null;
    price_on_invoice?: number | null;
    toppreise_allowed?: boolean | null;

    messe_price_netto?: number | null;
    display_price_netto?: number | null;
    display_discount_percent?: number | null;

    note: string | null;
    status: "matched" | "error";
    match_type: "ean" | "sony_article" | null;
    product_id: number | null;
    matched_product_name: string | null;
    error: string | null;
};

type PreviewResponse = {
    success: boolean;
    pricing_group: PricingGroup;
    campaign?: Campaign;
    file_name: string;
    total_rows: number;
    matched_rows: number;
    error_rows: number;
    rows: PreviewRow[];
};

type ImportResult = {
    success: boolean;
    dry_run: boolean;
    pricing_group: PricingGroup;
    campaign?: Campaign;
    file_name: string;
    total_rows: number;
    matched_rows: number;
    inserted_rows: number;
    updated_rows: number;
    error_rows: number;
    message: string;
};

export default function PricingImportPage() {
    const supabase = createClient();

    const [mode, setMode] = useState<ImportMode>("standard");

    const [pricingGroups, setPricingGroups] = useState<PricingGroup[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const [pricingGroupId, setPricingGroupId] = useState("");
    const [campaignId, setCampaignId] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [loadingGroups, setLoadingGroups] = useState(true);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [commitLoading, setCommitLoading] = useState(false);

    const [preview, setPreview] = useState<PreviewResponse | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const validRows = useMemo(() => {
        return preview?.rows.filter((row) => row.status === "matched") || [];
    }, [preview]);

    const errorRows = useMemo(() => {
        return preview?.rows.filter((row) => row.status === "error") || [];
    }, [preview]);

    const resetResult = () => {
        setPreview(null);
        setImportResult(null);
        setError(null);
    };

    const downloadExcelTemplate = (templateMode: ImportMode) => {
        const headers =
            templateMode === "standard"
                ? [
                    [
                        "EAN",
                        "Sony Article",
                        "Dealer Invoice Price",
                        "Price On Invoice",
                        "Toppreise Allowed",
                        "Note",
                    ],
                ]
                : [
                    [
                        "EAN",
                        "Sony Article",
                        "Messe Price Netto",
                        "Display Price Netto",
                        "Display Discount Percent",
                        "Note",
                    ],
                ];

        const worksheet = XLSX.utils.aoa_to_sheet(headers);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            templateMode === "standard" ? "Standardpreise" : "Kampagnenpreise"
        );

        const fileName =
            templateMode === "standard"
                ? "standard_gruppenpreise_vorlage.xlsx"
                : "kampagnen_gruppenpreise_vorlage.xlsx";

        XLSX.writeFile(workbook, fileName);
    };

    useEffect(() => {
        const loadPricingGroups = async () => {
            setLoadingGroups(true);

            const { data, error } = await supabase
                .from("dealer_pricing_groups")
                .select("pricing_group_id, code, name")
                .eq("active", true)
                .order("sort_order", { ascending: true });

            if (error) {
                setError(
                    `Pricing-Gruppen konnten nicht geladen werden: ${error.message}`
                );
            } else {
                setPricingGroups((data || []) as PricingGroup[]);
            }

            setLoadingGroups(false);
        };

        const loadCampaigns = async () => {
            setLoadingCampaigns(true);

            const { data, error } = await supabase
                .from("campaigns")
                .select("campaign_id, code, name")
                .eq("active", true)
                .order("start_date", { ascending: false });

            if (error) {
                setError(`Kampagnen konnten nicht geladen werden: ${error.message}`);
            } else {
                setCampaigns((data || []) as Campaign[]);
            }

            setLoadingCampaigns(false);
        };

        loadPricingGroups();
        loadCampaigns();
    }, [supabase]);

    const handlePreview = async () => {
        setError(null);
        setPreview(null);
        setImportResult(null);

        if (!pricingGroupId) {
            setError("Bitte zuerst eine Pricing-Gruppe auswählen.");
            return;
        }

        if (mode === "campaign" && !campaignId) {
            setError("Bitte zuerst eine Kampagne auswählen.");
            return;
        }

        if (!file) {
            setError("Bitte zuerst eine Excel-Datei auswählen.");
            return;
        }

        const formData = new FormData();
        formData.append("pricing_group_id", pricingGroupId);
        formData.append("file", file);

        if (mode === "campaign") {
            formData.append("campaign_id", campaignId);
        }

        const endpoint =
            mode === "campaign"
                ? "/api/admin/pricing-import/campaign-preview"
                : "/api/admin/pricing-import/preview";

        try {
            setPreviewLoading(true);

            const res = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data?.error || "Preview konnte nicht erstellt werden.");
                return;
            }

            setPreview(data as PreviewResponse);
        } catch {
            setError("Serverfehler beim Erstellen der Preview.");
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleCommit = async (dryRun: boolean) => {
        setError(null);
        setImportResult(null);

        if (!pricingGroupId) {
            setError("Bitte zuerst eine Pricing-Gruppe auswählen.");
            return;
        }

        if (mode === "campaign" && !campaignId) {
            setError("Bitte zuerst eine Kampagne auswählen.");
            return;
        }

        if (!file) {
            setError("Bitte zuerst eine Excel-Datei auswählen.");
            return;
        }

        if (!preview) {
            setError("Bitte zuerst eine Preview erstellen.");
            return;
        }

        if (validRows.length === 0) {
            setError("Es gibt keine gültigen Zeilen für den Import.");
            return;
        }

        if (!dryRun) {
            const confirmed = window.confirm(
                `Möchtest du wirklich ${validRows.length} gültige Zeilen importieren?`
            );

            if (!confirmed) return;
        }

        const formData = new FormData();
        formData.append("pricing_group_id", pricingGroupId);
        formData.append("file", file);
        formData.append("dry_run", dryRun ? "true" : "false");

        if (mode === "campaign") {
            formData.append("campaign_id", campaignId);
        }

        const endpoint =
            mode === "campaign"
                ? "/api/admin/pricing-import/campaign-commit"
                : "/api/admin/pricing-import/commit";

        try {
            setCommitLoading(true);

            const res = await fetch(endpoint, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setError(data?.error || "Import konnte nicht ausgeführt werden.");
                return;
            }

            setImportResult(data as ImportResult);
        } catch {
            setError("Serverfehler beim Import.");
        } finally {
            setCommitLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            Admin Pricing Import
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Standard- und Kampagnenpreise per Excel prüfen, testen und
                            importieren.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                        <FileSpreadsheet className="h-4 w-4" />
                        {mode === "standard" ? "Standardpreise" : "Kampagnenpreise"}
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 grid gap-3 md:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => {
                            setMode("standard");
                            resetResult();
                        }}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${mode === "standard"
                                ? "border-emerald-400 bg-emerald-50 text-emerald-800"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <div className="font-semibold">Standard-Gruppenpreise</div>
                        <div className="text-xs opacity-80">
                            Import in standard_product_group_prices
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMode("campaign");
                            resetResult();
                        }}
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${mode === "campaign"
                                ? "border-blue-400 bg-blue-50 text-blue-800"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <div className="font-semibold">Kampagnen-Gruppenpreise</div>
                        <div className="text-xs opacity-80">
                            Import in campaign_product_group_prices
                        </div>
                    </button>
                </div>

                <div
                    className={`grid gap-4 ${mode === "campaign" ? "md:grid-cols-4" : "md:grid-cols-3"
                        }`}
                >
                    {mode === "campaign" && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Kampagne
                            </label>

                            <select
                                value={campaignId}
                                onChange={(e) => {
                                    setCampaignId(e.target.value);
                                    resetResult();
                                }}
                                disabled={loadingCampaigns}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">
                                    {loadingCampaigns ? "Lade..." : "Kampagne auswählen"}
                                </option>

                                {campaigns.map((campaign) => (
                                    <option
                                        key={campaign.campaign_id}
                                        value={String(campaign.campaign_id)}
                                    >
                                        {campaign.name}
                                        {campaign.code ? ` (${campaign.code})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Pricing-Gruppe
                        </label>

                        <select
                            value={pricingGroupId}
                            onChange={(e) => {
                                setPricingGroupId(e.target.value);
                                resetResult();
                            }}
                            disabled={loadingGroups}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">
                                {loadingGroups ? "Lade..." : "Pricing-Gruppe auswählen"}
                            </option>

                            {pricingGroups.map((group) => (
                                <option
                                    key={group.pricing_group_id}
                                    value={String(group.pricing_group_id)}
                                >
                                    {group.name} ({group.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            Excel-Datei
                        </label>

                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={(e) => {
                                setFile(e.target.files?.[0] || null);
                                resetResult();
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
                        />
                    </div>

                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handlePreview}
                            disabled={previewLoading || commitLoading}
                            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${mode === "standard"
                                    ? "bg-emerald-600 hover:bg-emerald-700"
                                    : "bg-blue-600 hover:bg-blue-700"
                                }`}
                        >
                            <Upload className="h-4 w-4" />
                            {previewLoading ? "Prüfe Datei..." : "Preview erstellen"}
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-2 rounded-lg bg-gray-50 p-3 text-xs text-gray-600 md:flex-row md:items-center md:justify-between">
                    <div>
                        {mode === "standard" ? (
                            <>
                                Standard-Spalten: <b>EAN</b>, <b>Sony Article</b>,{" "}
                                <b>Dealer Invoice Price</b>, <b>Price On Invoice</b>,{" "}
                                <b>Toppreise Allowed</b>, <b>Note</b>.
                            </>
                        ) : (
                            <>
                                Kampagnen-Spalten: <b>EAN</b>, <b>Sony Article</b>,{" "}
                                <b>Messe Price Netto</b>, <b>Display Price Netto</b>,{" "}
                                <b>Display Discount Percent</b>, <b>Note</b>.
                            </>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => downloadExcelTemplate("standard")}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                            <Download className="h-3 w-3" />
                            Standard Vorlage
                        </button>

                        <button
                            type="button"
                            onClick={() => downloadExcelTemplate("campaign")}
                            className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                        >
                            <Download className="h-3 w-3" />
                            Kampagnen Vorlage
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            {preview && (
                <>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                            <div className="text-sm text-gray-500">Total Zeilen</div>
                            <div className="mt-1 text-2xl font-semibold text-gray-900">
                                {preview.total_rows}
                            </div>
                        </div>

                        <div
                            className={`rounded-2xl border p-5 shadow-sm ${mode === "standard"
                                    ? "border-emerald-200 bg-emerald-50"
                                    : "border-blue-200 bg-blue-50"
                                }`}
                        >
                            <div
                                className={`text-sm ${mode === "standard" ? "text-emerald-700" : "text-blue-700"
                                    }`}
                            >
                                Gefunden
                            </div>
                            <div
                                className={`mt-1 text-2xl font-semibold ${mode === "standard" ? "text-emerald-800" : "text-blue-800"
                                    }`}
                            >
                                {preview.matched_rows}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                            <div className="text-sm text-red-700">Fehler</div>
                            <div className="mt-1 text-2xl font-semibold text-red-800">
                                {preview.error_rows}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Import Preview
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Datei: {preview.file_name} · Gruppe:{" "}
                                    {preview.pricing_group.name}
                                    {preview.campaign ? ` · Kampagne: ${preview.campaign.name}` : ""}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => handleCommit(true)}
                                    disabled={commitLoading || validRows.length === 0}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <PlayCircle className="h-4 w-4" />
                                    {commitLoading ? "Prüfe..." : "Dry Run"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleCommit(false)}
                                    disabled={commitLoading || validRows.length === 0}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <Database className="h-4 w-4" />
                                    {commitLoading ? "Importiere..." : "Import durchführen"}
                                </button>
                            </div>
                        </div>

                        {importResult && (
                            <div
                                className={`mb-4 rounded-lg border p-4 text-sm ${importResult.dry_run
                                        ? "border-blue-200 bg-blue-50 text-blue-800"
                                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    }`}
                            >
                                <div className="font-semibold">{importResult.message}</div>
                                <div className="mt-2 grid gap-2 md:grid-cols-5">
                                    <div>Total: {importResult.total_rows}</div>
                                    <div>Gültig: {importResult.matched_rows}</div>
                                    <div>Neu: {importResult.inserted_rows}</div>
                                    <div>Aktualisiert: {importResult.updated_rows}</div>
                                    <div>Fehler: {importResult.error_rows}</div>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                                            Zeile
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                                            Status
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                                            EAN
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                                            Sony Artikel
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                                            Match
                                        </th>

                                        {mode === "standard" ? (
                                            <>
                                                <th className="px-3 py-2 text-right font-medium text-gray-600">
                                                    Dealer Invoice
                                                </th>
                                                <th className="px-3 py-2 text-right font-medium text-gray-600">
                                                    Price On Invoice
                                                </th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-3 py-2 text-right font-medium text-gray-600">
                                                    Messe Netto
                                                </th>
                                                <th className="px-3 py-2 text-right font-medium text-gray-600">
                                                    Display Netto
                                                </th>
                                                <th className="px-3 py-2 text-right font-medium text-gray-600">
                                                    Display Rabatt %
                                                </th>
                                            </>
                                        )}

                                        <th className="px-3 py-2 text-left font-medium text-gray-600">
                                            Fehler
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {preview.rows.map((row) => (
                                        <tr
                                            key={row.rowNumber}
                                            className={
                                                row.status === "error" ? "bg-red-50/60" : "bg-white"
                                            }
                                        >
                                            <td className="px-3 py-2 text-gray-700">
                                                {row.rowNumber}
                                            </td>

                                            <td className="px-3 py-2">
                                                {row.status === "matched" ? (
                                                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                                                        OK · {row.match_type}
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                                                        Fehler
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-3 py-2 text-gray-700">
                                                {row.ean || "—"}
                                            </td>

                                            <td className="px-3 py-2 text-gray-700">
                                                {row.sony_article || "—"}
                                            </td>

                                            <td className="px-3 py-2 text-gray-700">
                                                {row.matched_product_name || "—"}
                                            </td>

                                            {mode === "standard" ? (
                                                <>
                                                    <td className="px-3 py-2 text-right text-gray-700">
                                                        {row.dealer_invoice_price ?? "—"}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-gray-700">
                                                        {row.price_on_invoice ?? "—"}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-3 py-2 text-right text-gray-700">
                                                        {row.messe_price_netto ?? "—"}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-gray-700">
                                                        {row.display_price_netto ?? "—"}
                                                    </td>
                                                    <td className="px-3 py-2 text-right text-gray-700">
                                                        {row.display_discount_percent ?? "—"}
                                                    </td>
                                                </>
                                            )}

                                            <td className="px-3 py-2 text-red-700">
                                                {row.error || "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {errorRows.length > 0 && (
                            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                Es gibt {errorRows.length} Fehlerzeilen. Diese werden beim
                                Import nicht übernommen.
                            </div>
                        )}

                        {validRows.length > 0 && (
                            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                {validRows.length} Zeilen sind gültig und bereit für Dry Run
                                oder Import.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}