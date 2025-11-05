// src/utils/exportUtils.js

/**
 * exportUtils - CSV / JSON / PDF (optional) helpers
 *
 * CSV: simple implementation that handles arrays of plain objects
 * JSON: download file
 * PDF: tries to use jsPDF + html2canvas if available (optional)
 */

/* Simple CSV serializer */
export function toCSV(rows = [], columns = null) {
  if (!Array.isArray(rows)) rows = [];
  if (rows.length === 0) return "";

  const keys = columns || Object.keys(rows[0]);
  const escape = (v) => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    if (s.includes('"') || s.includes(",") || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = keys.join(",");
  const lines = rows.map(r => keys.map(k => escape(r[k])).join(","));
  return [header, ...lines].join("\n");
}

/* trigger CSV file download */
export function exportToCSV(rows = [], filename = "export.csv", columns = null) {
  const csv = toCSV(rows, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* save JSON */
export function exportToJSON(obj = {}, filename = "export.json") {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* Try to export a DOM node as PDF using html2canvas + jsPDF (both optional) */
export async function exportNodeAsPDF(node, filename = "export.pdf", opts = {}) {
  // node: DOM element
  if (!node) throw new Error("No DOM node provided");
  try {
    // prefer libraries if they exist in global scope
    const html2canvas = window.html2canvas || (await import("html2canvas").then(m=>m.default));
    const jsPDF = window.jspdf?.jsPDF || (await import("jspdf").then(m=>m.jsPDF || m.default));
    const canvas = await html2canvas(node, opts.html2canvas || {});
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF(opts.jsPDF || { orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
    return true;
  } catch (e) {
    console.warn("exportNodeAsPDF failed:", e);
    throw e;
  }
}
