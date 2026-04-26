from pathlib import Path

path = Path('AdminDealerDetailPage.tsx')
text = path.read_text(encoding='utf-8')

# 1) Besuchshistorie: nur einfügen, falls noch nicht vorhanden
needle_tv_history = '<div>TV Sony</div><div className="font-semibold">{formatCurrency(visitTvSony)} · {formatPercent(calcSharePercent(visitTvSony, visitTvTotal))}</div>'
insert_tv_history = needle_tv_history + '''\n      <div>TV Qty</div>\n        <div className="font-semibold">\n          {formatInteger(visit.tv_sony_qty)} / {formatInteger(visit.tv_total_qty)} · {formatPercent(calcSharePercent(visit.tv_sony_qty, visit.tv_total_qty))}\n        </div>'''
if needle_tv_history in text and 'calcSharePercent(visit.tv_sony_qty, visit.tv_total_qty)' not in text:
    text = text.replace(needle_tv_history, insert_tv_history, 1)

needle_sb_history = '<div>SB Sony</div><div className="font-semibold">{formatCurrency(visitSbSony)} · {formatPercent(calcSharePercent(visitSbSony, visitSbTotal))}</div>'
insert_sb_history = needle_sb_history + '''\n      <div>SB Qty</div>\n        <div className="font-semibold">\n          {formatInteger(visit.sb_sony_qty)} / {formatInteger(visit.sb_total_qty)} · {formatPercent(calcSharePercent(visit.sb_sony_qty, visit.sb_total_qty))}\n        </div>'''
if needle_sb_history in text and 'calcSharePercent(visit.sb_sony_qty, visit.sb_total_qty)' not in text:
    text = text.replace(needle_sb_history, insert_sb_history, 1)

# 2) latestVisitSellout Objekt
needle_tv_latest = '    tvShare: latestVisit?.tv_sony_share_percent_snapshot ?? null,\n'
insert_tv_latest = needle_tv_latest + '    tvTotalQty: latestVisit?.tv_total_qty ?? null,\n    tvSonyQty: latestVisit?.tv_sony_qty ?? null,\n    tvQtyShare: calcSharePercent(latestVisit?.tv_sony_qty, latestVisit?.tv_total_qty),\n'
if needle_tv_latest in text and 'tvQtyShare: calcSharePercent(latestVisit?.tv_sony_qty, latestVisit?.tv_total_qty),' not in text:
    text = text.replace(needle_tv_latest, insert_tv_latest, 1)

needle_sb_latest = '    sbShare: latestVisit?.sb_sony_share_percent_snapshot ?? null,\n'
insert_sb_latest = needle_sb_latest + '    sbTotalQty: latestVisit?.sb_total_qty ?? null,\n    sbSonyQty: latestVisit?.sb_sony_qty ?? null,\n    sbQtyShare: calcSharePercent(latestVisit?.sb_sony_qty, latestVisit?.sb_total_qty),\n'
if needle_sb_latest in text and 'sbQtyShare: calcSharePercent(latestVisit?.sb_sony_qty, latestVisit?.sb_total_qty),' not in text:
    text = text.replace(needle_sb_latest, insert_sb_latest, 1)

# 3) Letzter gespeicherter Besuch
needle_tv_saved = '<div>TV Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.tvSony)} / {formatCurrency(latestVisitSellout.tvTotal)} · {formatPercent(latestVisitSellout.tvShare)}</div>'
insert_tv_saved = needle_tv_saved + '<div>TV Qty Sony</div><div className="font-semibold text-gray-900">{formatInteger(latestVisitSellout.tvSonyQty)} / {formatInteger(latestVisitSellout.tvTotalQty)} · {formatPercent(latestVisitSellout.tvQtyShare)}</div>'
if needle_tv_saved in text and 'latestVisitSellout.tvQtyShare' not in text:
    text = text.replace(needle_tv_saved, insert_tv_saved, 1)

needle_sb_saved = '<div>Soundbar Sony</div><div className="font-semibold text-gray-900">{formatCurrency(latestVisitSellout.sbSony)} / {formatCurrency(latestVisitSellout.sbTotal)} · {formatPercent(latestVisitSellout.sbShare)}</div>'
insert_sb_saved = needle_sb_saved + '<div>Soundbar Qty Sony</div><div className="font-semibold text-gray-900">{formatInteger(latestVisitSellout.sbSonyQty)} / {formatInteger(latestVisitSellout.sbTotalQty)} · {formatPercent(latestVisitSellout.sbQtyShare)}</div>'
if needle_sb_saved in text and 'latestVisitSellout.sbQtyShare' not in text:
    text = text.replace(needle_sb_saved, insert_sb_saved, 1)

path.write_text(text, encoding='utf-8')
print('OK: Qty-Felder eingefügt oder bereits vorhanden.')
