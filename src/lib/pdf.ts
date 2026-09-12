import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { SAFEQUEST_BRAND } from "@/lib/branding";
import {
  LETTERHEAD_MARGIN_BOTTOM_MM,
  LETTERHEAD_MARGIN_TOP_MM,
  LETTERHEAD_MARGIN_X_MM,
} from "@/components/documents/LetterheadPage";

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

export async function downloadElementPdf(element: HTMLElement, filename: string) {
  const content = element.querySelector<HTMLElement>("[data-letterhead-content]") || element;
  const letterhead = await loadImage(SAFEQUEST_BRAND.letterhead);

  const canvas = await html2canvas(content, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: null,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const marginX = LETTERHEAD_MARGIN_X_MM;
  const marginTop = LETTERHEAD_MARGIN_TOP_MM;
  const contentW = pageW - marginX * 2;
  const contentH = pageH - marginTop - LETTERHEAD_MARGIN_BOTTOM_MM;
  const fullH = (canvas.height * contentW) / canvas.width;
  const slicePx = Math.max(1, Math.floor((contentH / fullH) * canvas.height));

  let yPx = 0;
  let pageIndex = 0;
  while (yPx < canvas.height) {
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(letterhead, "PNG", 0, 0, pageW, pageH);

    const hPx = Math.min(slicePx, canvas.height - yPx);
    const slice = document.createElement("canvas");
    slice.width = canvas.width;
    slice.height = hPx;
    const ctx = slice.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, slice.width, slice.height);
      ctx.drawImage(canvas, 0, yPx, canvas.width, hPx, 0, 0, canvas.width, hPx);
    }
    const sliceMm = (hPx / canvas.height) * fullH;
    pdf.addImage(slice.toDataURL("image/png"), "PNG", marginX, marginTop, contentW, sliceMm);

    yPx += hPx;
    pageIndex += 1;
  }

  pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
