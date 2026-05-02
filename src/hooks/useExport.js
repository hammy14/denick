/**
 * useExport
 * Shared CSV and XLSX export utilities.
 *
 * Usage:
 *   import { exportCSV, exportXLSX } from '../hooks/useExport'
 *
 *   exportCSV('my_cards', headers, rows)
 *   exportXLSX('my_cards', sheetName, headers, rows)
 *
 * Both accept:
 *   filename  - string without extension
 *   sheetName - (XLSX only) worksheet tab name
 *   headers   - string[]
 *   rows      - (string | number)[][]  — raw values, not pre-formatted strings
 *
 * For XLSX, numeric values stay numeric so Excel can sort/sum them.
 * For CSV, values are quoted and formatted as strings.
 */

import * as XLSX from 'xlsx-js-style'

// ── CSV ───────────────────────────────────────────────────────────────────────
export function exportCSV(filename, headers, rows) {
  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines  = [headers, ...rows].map(row => row.map(escape).join(','))
  const blob   = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, `${filename}.csv`)
}

// ── XLSX ──────────────────────────────────────────────────────────────────────
export function exportXLSX(filename, sheetName, headers, rows) {
  const wsData = [headers, ...rows]
  const ws     = XLSX.utils.aoa_to_sheet(wsData)

  // Auto-size columns based on max content width
  const colWidths = headers.map((h, ci) => {
    const maxLen = Math.max(
      String(h).length,
      ...rows.map(r => String(r[ci] ?? '').length)
    )
    return { wch: Math.min(maxLen + 2, 60) }
  })
  ws['!cols'] = colWidths

  // Bold header row
  const range = XLSX.utils.decode_range(ws['!ref'])
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = ws[XLSX.utils.encode_cell({ r: 0, c })]
    if (cell) cell.s = { font: { bold: true } }
  }

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31))
  XLSX.writeFile(wb, `${filename}.xlsx`)
}

// ── Trigger download helper ───────────────────────────────────────────────────
function triggerDownload(blob, name) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
