// src/utils/exportUtils.js

/**
 * exportUtils - CSV / JSON / PDF helpers
 *
 * Exports (named):
 *  - toCSV(rows, columns)
 *  - exportToCSV(rows, filename, columns)
 *  - exportToJSON(obj, filename)
 *  - exportNodeAsPDF(nodeOrId, filename, opts)
 *
 * PDF: will try to dynamically import html2canvas and jspdf if not present on window.
 * If PDF libraries are unavailable, it falls back to opening a print window for the node.
 */

/* Simple CSV serializer */
export function toCSV(rows = [], columns = null) {
  if (!Array.isArray(rows)) rows = [];
  if (rows.length === 0) {
    // If columns provided, emit header only; otherwise return empty string
    if (Array.isArray(columns) && columns.length) {
      return columns.join(",") + "\n";
    }
    return "";
  }

  const keys = columns && columns.length ? columns : Object.keys(rows[0]);
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
  try {
    const csv = toCSV(rows, columns);
    // If csv is empty (no rows and no columns), fallback to JSON download
    if (!csv) {
      return exportToJSON(rows, filename.replace(/\.csv$/i, ".json"));
    }
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("exportToCSV error:", err);
    throw err;
  }
}

/* save JSON */
export function exportToJSON(obj = {}, filename = "export.json") {
  try {
    const content = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error("exportToJSON error:", err);
    throw err;
  }
}

/**
 * exportNodeAsPDF(nodeOrId, filename = 'export.pdf', opts = {})
 *
 * - nodeOrId: DOM Element or string id of element
 * - tries to use html2canvas + jsPDF (dynamic import if not present)
 * - if libraries unavailable, falls back to opening a print window of the node
 */
export async function exportNodeAsPDF(nodeOrId, filename = "export.pdf", opts = {}) {
  try {
    // resolve element if id string passed
    let node = null;
    if (typeof nodeOrId === "string") {
      node = document.getElementById(nodeOrId);
    } else if (nodeOrId instanceof Element) {
      node = nodeOrId;
    } else {
      throw new Error("exportNodeAsPDF: provided node is not a DOM element or valid id string");
    }

    if (!node) throw new Error("exportNodeAsPDF: DOM node not found");

    // Try to use html2canvas + jsPDF
    let html2canvasLib = window.html2canvas;
    let jsPDFClass = window.jspdf?.jsPDF;

    // dynamic import only if globals missing
    if (!html2canvasLib) {
      try {
        const m = await import(/* webpackChunkName: "html2canvas" */ "html2canvas");
        html2canvasLib = m.default || m;
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        // ignore; will fallback later
      }
    }
    if (!jsPDFClass) {
      try {
        const m = await import(/* webpackChunkName: "jspdf" */ "jspdf");
        jsPDFClass = m.jsPDF || m.default || null;
      // eslint-disable-next-line no-unused-vars
      } catch (e) {
        // ignore; will fallback later
      }
    }

    if (html2canvasLib && jsPDFClass) {
      // render canvas
      const canvas = await html2canvasLib(node, opts.html2canvas || { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // create pdf sized to A4 or to canvas size if opts specify
      const pdfOpts = opts.jsPDF || { orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] };
      const pdf = new jsPDFClass(pdfOpts);
      // compute fit if user wants fit-to-page
      if (opts.fitToPage) {
        const pageW = pdf.internal.pageSize.getWidth();
        const pageH = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
        const w = canvas.width * ratio;
        const h = canvas.height * ratio;
        pdf.addImage(imgData, "PNG", (pageW - w) / 2, (pageH - h) / 2, w, h);
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      }
      pdf.save(filename);
      return true;
    }

    // Fallback: open a print-friendly window containing the node's HTML
    const newWindow = window.open("", "_blank");
    if (!newWindow) throw new Error("Could not open print window");
    newWindow.document.write("<html><head><title>Export</title>");
    // copy computed styles by inlining stylesheet links (basic)
    Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).forEach((el) => {
      newWindow.document.write(el.outerHTML);
    });
    newWindow.document.write("</head><body>");
    newWindow.document.write(node.outerHTML);
    newWindow.document.write("</body></html>");
    newWindow.document.close();
    newWindow.focus();
    // let the user print/save as PDF manually (or auto-invoke print)
    if (opts.autoPrint) {
      // delay to allow styles to load
      setTimeout(() => newWindow.print(), 500);
    }
    return true;
  } catch (err) {
    console.warn("exportNodeAsPDF failed:", err);
    throw err;
  }
}
