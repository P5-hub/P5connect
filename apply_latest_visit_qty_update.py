from pathlib import Path

file_path = Path("AdminDealerDetailPage.tsx")

if not file_path.exists():
    raise FileNotFoundError(
        "AdminDealerDetailPage.tsx wurde im aktuellen Ordner nicht gefunden. "
        "Lege dieses Script in denselben Ordner wie die Datei oder passe file_path an."
    )

content = file_path.read_text(encoding="utf-8")

replacements = [
    (
        'tvShare: latestVisit?.tv_sony_share_percent_snapshot ?? null,',
        '''tvShare: latestVisit?.tv_sony_share_percent_snapshot ?? null,
    tvTotalQty: latestVisit?.tv_total_qty ?? null,
    tvSonyQty: latestVisit?.tv_sony_qty ?? null,
    tvQtyShare: calcSharePercent(latestVisit?.tv_sony_qty, latestVisit?.tv_total_qty),'''
    ),
    (
        'sbShare: latestVisit?.sb_sony_share_percent_snapshot ?? null,',
        '''sbShare: latestVisit?.sb_sony_share_percent_snapshot ?? null,
    sbTotalQty: latestVisit?.sb_total_qty ?? null,
    sbSonyQty: latestVisit?.sb_sony_qty ?? null,
    sbQtyShare: calcSharePercent(latestVisit?.sb_sony_qty, latestVisit?.sb_total_qty),'''
    ),
    (
        '<div>TV Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.tvSony)} / {formatCurrency(latestVisitSellout.tvTotal)} · {formatPercent(latestVisitSellout.tvShare)}</div>',
        '''<div>TV Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.tvSony)} / {formatCurrency(latestVisitSellout.tvTotal)} · {formatPercent(latestVisitSellout.tvShare)}</div><div>TV Qty Sony</div><div className="font-semibold text-gray-900">{formatInteger(latestVisitSellout.tvSonyQty)} / {formatInteger(latestVisitSellout.tvTotalQty)} · {formatPercent(latestVisitSellout.tvQtyShare)}</div>'''
    ),
    (
        '<div>Soundbar Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.sbSony)} / {formatCurrency(latestVisitSellout.sbTotal)} · {formatPercent(latestVisitSellout.sbShare)}</div>',
        '''<div>Soundbar Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.sbSony)} / {formatCurrency(latestVisitSellout.sbTotal)} · {formatPercent(latestVisitSellout.sbShare)}</div><div>Soundbar Qty Sony</div><div className="font-semibold text-gray-900">{formatInteger(latestVisitSellout.sbSonyQty)} / {formatInteger(latestVisitSellout.sbTotalQty)} · {formatPercent(latestVisitSellout.sbQtyShare)}</div>'''
    ),
]

missing = []
for old, new in replacements:
    if old not in content:
        if new in content:
            continue
        missing.append(old)
    else:
        content = content.replace(old, new, 1)

if missing:
    print("❌ Nicht alle Suchstellen wurden gefunden. Fehlende Suchstellen:")
    for item in missing:
        print("- " + item[:180] + ("..." if len(item) > 180 else ""))
    raise SystemExit(1)

backup_path = file_path.with_suffix(file_path.suffix + ".backup")
backup_path.write_text(file_path.read_text(encoding="utf-8"), encoding="utf-8")
file_path.write_text(content, encoding="utf-8")

print("✅ Fertig. AdminDealerDetailPage.tsx wurde aktualisiert.")
print(f"Backup erstellt: {backup_path}")
