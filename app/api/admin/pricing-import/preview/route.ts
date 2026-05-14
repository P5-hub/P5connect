import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import * as XLSX from "xlsx";

type ProductRow = {
    product_id: number;
    ean: string;
    sony_article: string | null;
    product_name: string;
    active: boolean | null;
};

type PreviewRow = {
    rowNumber: number;
    ean: string | null;
    sony_article: string | null;
    product_name: string | null;
    dealer_invoice_price: number | null;
    price_on_invoice: number | null;
    toppreise_allowed: boolean | null;
    note: string | null;
    status: "matched" | "error";
    match_type: "ean" | "sony_article" | null;
    product_id: number | null;
    matched_product_name: string | null;
    error: string | null;
};

function normalizeHeader(value: unknown): string {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");
}

function normalizeEan(value: unknown): string | null {
    const raw = String(value || "").trim();
    if (!raw) return null;
    return raw.replace(/\.0$/, "");
}

function normalizeText(value: unknown): string | null {
    const raw = String(value || "").trim();
    return raw || null;
}

function parseNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;

    const raw = String(value)
        .trim()
        .replace("CHF", "")
        .replace(/\s/g, "")
        .replace(",", ".");

    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
}

function parseBoolean(value: unknown): boolean | null {
    if (value === null || value === undefined || value === "") return null;

    const raw = String(value).trim().toLowerCase();

    if (["true", "yes", "ja", "1", "x"].includes(raw)) return true;
    if (["false", "no", "nein", "0"].includes(raw)) return false;

    return null;
}

function pick(row: Record<string, unknown>, keys: string[]): unknown {
    for (const key of keys) {
        if (row[key] !== undefined) return row[key];
    }
    return null;
}

export async function POST(req: NextRequest) {
    try {
        const supabaseUserClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return req.cookies.getAll();
                    },
                    setAll() {
                        // keine Cookies nötig
                    },
                },
            }
        );

        const {
            data: { user },
            error: userError,
        } = await supabaseUserClient.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: "Nicht eingeloggt." }, { status: 401 });
        }

        if (
            user.app_metadata?.role !== "admin" &&
            user.app_metadata?.role !== "superadmin"
        ) {
            return NextResponse.json(
                { error: "Keine Berechtigung." },
                { status: 403 }
            );
        }

        const formData = await req.formData();

        const file = formData.get("file");
        const pricingGroupIdRaw = formData.get("pricing_group_id");

        const pricing_group_id = Number(pricingGroupIdRaw);

        if (!pricing_group_id || Number.isNaN(pricing_group_id)) {
            return NextResponse.json(
                { error: "pricing_group_id ist ungültig." },
                { status: 400 }
            );
        }

        if (!(file instanceof File)) {
            return NextResponse.json(
                { error: "Keine Excel-Datei erhalten." },
                { status: 400 }
            );
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        const { data: pricingGroup, error: pricingGroupError } =
            await supabaseAdmin
                .from("dealer_pricing_groups")
                .select("pricing_group_id, code, name, active")
                .eq("pricing_group_id", pricing_group_id)
                .eq("active", true)
                .maybeSingle();

        if (pricingGroupError) {
            return NextResponse.json(
                {
                    error: `Pricing-Gruppe konnte nicht geprüft werden: ${pricingGroupError.message}`,
                },
                { status: 500 }
            );
        }

        if (!pricingGroup) {
            return NextResponse.json(
                { error: "Pricing-Gruppe nicht gefunden oder inaktiv." },
                { status: 404 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
            return NextResponse.json(
                { error: "Excel-Datei enthält kein Tabellenblatt." },
                { status: 400 }
            );
        }

        const sheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
            defval: null,
        });

        const normalizedRows = rawRows.map((rawRow) => {
            const normalized: Record<string, unknown> = {};

            for (const [key, value] of Object.entries(rawRow)) {
                normalized[normalizeHeader(key)] = value;
            }

            return normalized;
        });

        const { data: products, error: productsError } = await supabaseAdmin
            .from("products")
            .select("product_id, ean, sony_article, product_name, active")
            .in("active", [true, false]);

        if (productsError) {
            return NextResponse.json(
                { error: `Produkte konnten nicht geladen werden: ${productsError.message}` },
                { status: 500 }
            );
        }

        const productRows = (products || []) as ProductRow[];

        const productsByEan = new Map<string, ProductRow>();
        const productsBySonyArticle = new Map<string, ProductRow[]>();

        for (const product of productRows) {
            const ean = normalizeEan(product.ean);
            if (ean) productsByEan.set(ean, product);

            const sonyArticle = normalizeText(product.sony_article);
            if (sonyArticle) {
                const key = sonyArticle.toLowerCase();
                const list = productsBySonyArticle.get(key) || [];
                list.push(product);
                productsBySonyArticle.set(key, list);
            }
        }

        const previewRows: PreviewRow[] = normalizedRows.map((row, index) => {
            const ean = normalizeEan(
                pick(row, ["ean", "ean_code", "ean_code_", "ean_nummer"])
            );

            const sony_article = normalizeText(
                pick(row, [
                    "sony_article",
                    "sony_artikel",
                    "artikel",
                    "artikelnummer",
                    "sony_artikelnummer",
                    "article",
                ])
            );

            const product_name = normalizeText(
                pick(row, ["product_name", "produkt", "produktname", "name", "model"])
            );

            const dealer_invoice_price = parseNumber(
                pick(row, [
                    "dealer_invoice_price",
                    "haendlerpreis",
                    "handlerpreis",
                    "dealer_price",
                    "einkaufspreis",
                    "preis",
                ])
            );

            const price_on_invoice = parseNumber(
                pick(row, [
                    "price_on_invoice",
                    "rechnungspreis",
                    "displaypreis",
                    "displaypreis_netto",
                    "invoice_price",
                ])
            );

            const toppreise_allowed = parseBoolean(
                pick(row, [
                    "toppreise_allowed",
                    "toppreise",
                    "toppreise_erlaubt",
                    "toppreise_allowed?",
                ])
            );

            const note = normalizeText(
                pick(row, ["note", "bemerkung", "kommentar", "comment"])
            );

            if (!ean && !sony_article) {
                return {
                    rowNumber: index + 2,
                    ean,
                    sony_article,
                    product_name,
                    dealer_invoice_price,
                    price_on_invoice,
                    toppreise_allowed,
                    note,
                    status: "error",
                    match_type: null,
                    product_id: null,
                    matched_product_name: null,
                    error: "Keine EAN und kein Sony Artikel vorhanden.",
                };
            }

            if (dealer_invoice_price === null && price_on_invoice === null) {
                return {
                    rowNumber: index + 2,
                    ean,
                    sony_article,
                    product_name,
                    dealer_invoice_price,
                    price_on_invoice,
                    toppreise_allowed,
                    note,
                    status: "error",
                    match_type: null,
                    product_id: null,
                    matched_product_name: null,
                    error:
                        "Kein Preis vorhanden. Mindestens dealer_invoice_price oder price_on_invoice ist nötig.",
                };
            }

            if (ean) {
                const matchedByEan = productsByEan.get(ean);

                if (matchedByEan) {
                    if (matchedByEan.active !== true) {
                        return {
                            rowNumber: index + 2,
                            ean,
                            sony_article,
                            product_name,
                            dealer_invoice_price,
                            price_on_invoice,
                            toppreise_allowed,
                            note,
                            status: "error",
                            match_type: null,
                            product_id: matchedByEan.product_id,
                            matched_product_name: matchedByEan.product_name,
                            error: "Produkt gefunden, aber inaktiv.",
                        };
                    }

                    return {
                        rowNumber: index + 2,
                        ean,
                        sony_article,
                        product_name,
                        dealer_invoice_price,
                        price_on_invoice,
                        toppreise_allowed,
                        note,
                        status: "matched",
                        match_type: "ean",
                        product_id: matchedByEan.product_id,
                        matched_product_name: matchedByEan.product_name,
                        error: null,
                    };
                }
            }

            if (sony_article) {
                const matches = productsBySonyArticle.get(sony_article.toLowerCase()) || [];

                if (matches.length === 1) {
                    if (matches[0].active !== true) {
                        return {
                            rowNumber: index + 2,
                            ean,
                            sony_article,
                            product_name,
                            dealer_invoice_price,
                            price_on_invoice,
                            toppreise_allowed,
                            note,
                            status: "error",
                            match_type: null,
                            product_id: matches[0].product_id,
                            matched_product_name: matches[0].product_name,
                            error: "Produkt gefunden, aber inaktiv.",
                        };
                    }

                    return {
                        rowNumber: index + 2,
                        ean,
                        sony_article,
                        product_name,
                        dealer_invoice_price,
                        price_on_invoice,
                        toppreise_allowed,
                        note,
                        status: "matched",
                        match_type: "sony_article",
                        product_id: matches[0].product_id,
                        matched_product_name: matches[0].product_name,
                        error: null,
                    };
                }

                if (matches.length > 1) {
                    return {
                        rowNumber: index + 2,
                        ean,
                        sony_article,
                        product_name,
                        dealer_invoice_price,
                        price_on_invoice,
                        toppreise_allowed,
                        note,
                        status: "error",
                        match_type: null,
                        product_id: null,
                        matched_product_name: null,
                        error:
                            "Sony Artikel ist nicht eindeutig. Bitte EAN verwenden oder Produkt manuell prüfen.",
                    };
                }
            }

            return {
                rowNumber: index + 2,
                ean,
                sony_article,
                product_name,
                dealer_invoice_price,
                price_on_invoice,
                toppreise_allowed,
                note,
                status: "error",
                match_type: null,
                product_id: null,
                matched_product_name: null,
                error: "Produkt nicht gefunden.",
            };
        });

        const matchedRows = previewRows.filter((r) => r.status === "matched");
        const errorRows = previewRows.filter((r) => r.status === "error");

        return NextResponse.json({
            success: true,
            pricing_group: pricingGroup,
            file_name: file.name,
            total_rows: previewRows.length,
            matched_rows: matchedRows.length,
            error_rows: errorRows.length,
            rows: previewRows,
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unbekannter Serverfehler";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}