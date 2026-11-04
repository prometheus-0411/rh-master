// APP-02 : lecture d'un PDF directement dans le navigateur (aucun envoi pour un PDF texte, DEC-A07).
const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";

/* eslint-disable @typescript-eslint/no-explicit-any */
let pdfjsP: Promise<any> | null = null;

function chargerScript(src: string) {
  return new Promise<void>((ok, ko) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => ok();
    s.onerror = () => ko(new Error("load"));
    document.head.append(s);
  });
}

function pdfjs(): Promise<any> {
  pdfjsP ??= chargerScript(PDFJS + "pdf.min.js")
    .then(() => {
      const L = (window as any).pdfjsLib;
      L.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.js";
      return L;
    })
    .catch((e) => {
      pdfjsP = null;
      throw e;
    });
  return pdfjsP;
}

export async function ouvrirPdf(f: File): Promise<any> {
  const L = await pdfjs();
  return L.getDocument({ data: new Uint8Array(await f.arrayBuffer()), isEvalSupported: false }).promise;
}

export async function texteDuPdf(pdf: any): Promise<string> {
  const pages: string[] = [];
  for (let n = 1; n <= Math.min(pdf.numPages, 8); n++) {
    const tc = await (await pdf.getPage(n)).getTextContent();
    let ligne = "";
    const out: string[] = [];
    for (const it of tc.items) {
      if (typeof it.str !== "string") continue;
      ligne += it.str;
      if (it.hasEOL) {
        out.push(ligne);
        ligne = "";
      } else if (it.str && !/\s$/.test(it.str)) ligne += " ";
    }
    if (ligne.trim()) out.push(ligne);
    pages.push(out.map((l) => l.replace(/[ \t]+/g, " ").trim()).join("\n"));
  }
  return pages.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

/** Pages rendues en JPEG (base64 sans en-tête), pour la retranscription d'un PDF scanné. */
export async function imagesDuPdf(pdf: any, max = 3): Promise<string[]> {
  const out: string[] = [];
  for (let n = 1; n <= Math.min(pdf.numPages, max); n++) {
    const page = await pdf.getPage(n);
    const vp = page.getViewport({ scale: 1.5 });
    const cv = document.createElement("canvas");
    cv.width = vp.width;
    cv.height = vp.height;
    const ctx = cv.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, cv.width, cv.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    out.push(cv.toDataURL("image/jpeg", 0.8).split(",")[1]);
  }
  return out;
}
