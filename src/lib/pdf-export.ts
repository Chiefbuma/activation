import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type PdfOrientation = 'portrait' | 'landscape';

type ExportElementToPdfOptions = {
  element: HTMLElement;
  filename: string;
  orientation?: PdfOrientation;
  marginMm?: number;
};

type ExportPassportPdfOptions = {
  element: HTMLElement;
  filename: string;
  reportTitle: string;
  reportSubtitle: string;
  reportDateLabel: string;
  corporateId?: string;
};

const A4_RENDER_WIDTH_PX: Record<PdfOrientation, number> = {
  portrait: 794,
  landscape: 1123,
};

const PASSPORT_MARGIN_MM = 12;

function slugWaitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'));
  return Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        })
    )
  );
}

async function renderElementToCanvas(element: HTMLElement) {
  await document.fonts.ready;
  await slugWaitForImages(element);
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

  return html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
    width: element.scrollWidth,
    height: element.scrollHeight,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
    scrollX: 0,
    scrollY: 0,
  });
}

export async function exportElementToPdf({
  element,
  filename,
  orientation = 'portrait',
  marginMm = 10,
}: ExportElementToPdfOptions) {
  await document.fonts.ready;

  const exportHost = document.createElement('div');
  exportHost.setAttribute('data-pdf-export', 'true');
  Object.assign(exportHost.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${A4_RENDER_WIDTH_PX[orientation]}px`,
    padding: '0',
    margin: '0',
    background: '#ffffff',
    zIndex: '-1',
  });

  const clone = element.cloneNode(true) as HTMLElement;
  Object.assign(clone.style, {
    width: '100%',
    maxWidth: 'none',
    margin: '0',
    boxSizing: 'border-box',
  });

  exportHost.appendChild(clone);
  document.body.appendChild(exportHost);

  try {
    const canvas = await renderElementToCanvas(clone);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const printableWidth = pageWidth - marginMm * 2;
    const printableHeight = pageHeight - marginMm * 2;
    const renderedHeight = (canvas.height * printableWidth) / canvas.width;

    let remainingHeight = renderedHeight;
    let offsetY = marginMm;

    pdf.addImage(imgData, 'PNG', marginMm, offsetY, printableWidth, renderedHeight, undefined, 'FAST');
    remainingHeight -= printableHeight;

    while (remainingHeight > 0) {
      pdf.addPage();
      offsetY = marginMm - (renderedHeight - remainingHeight);
      pdf.addImage(imgData, 'PNG', marginMm, offsetY, printableWidth, renderedHeight, undefined, 'FAST');
      remainingHeight -= printableHeight;
    }

    pdf.save(filename);
  } finally {
    exportHost.remove();
  }
}

function getPrintableHeadMarkup() {
  const styleNodes = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style')
  ).map((node) => node.outerHTML);

  return styleNodes.join('\n');
}

function preparePassportPrintClone(element: HTMLElement) {
  const clone = element.cloneNode(true) as HTMLElement;
  clone.setAttribute('data-pdf-export', 'true');
  clone.setAttribute('data-passport-print-root', 'true');
  Object.assign(clone.style, {
    width: '100%',
    maxWidth: 'none',
    margin: '0',
    boxSizing: 'border-box',
    background: '#ffffff',
  });

  const [, sectionsBlock] = Array.from(clone.children) as HTMLElement[];
  if (sectionsBlock) {
    Array.from(sectionsBlock.children).forEach((section) => {
      const sectionElement = section as HTMLElement;
      sectionElement.setAttribute('data-passport-print-section', 'true');
      sectionElement.style.breakInside = 'avoid';
      sectionElement.style.pageBreakInside = 'avoid';
    });
  }

  return clone;
}

async function waitForPrintableDocument(printDocument: Document) {
  if (printDocument.fonts) {
    await printDocument.fonts.ready;
  }

  const images = Array.from(printDocument.images);
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        })
    )
  );

  await new Promise<void>((resolve) => {
    const view = printDocument.defaultView;
    if (!view) {
      window.setTimeout(resolve, 32);
      return;
    }
    view.requestAnimationFrame(() => resolve());
  });
  await new Promise<void>((resolve) => {
    const view = printDocument.defaultView;
    if (!view) {
      window.setTimeout(resolve, 32);
      return;
    }
    view.requestAnimationFrame(() => resolve());
  });
}

export async function exportPassportPdf({
  element,
  filename,
  reportTitle,
  reportSubtitle,
  reportDateLabel,
  corporateId = 'all',
}: ExportPassportPdfOptions) {
  const slug = filename.replace(/\.pdf$/i, '');

  try {
    const params = new URLSearchParams({
      corporateId,
      slug,
    });
    const response = await fetch(`/api/passport-pdf?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
    }, 1000);
    return;
  } catch (error) {
    console.warn('PASSPORT_PDF_DOWNLOAD_FALLBACK', error);
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window.');
  }

  try {
    const clone = preparePassportPrintClone(element);
    const styleMarkup = getPrintableHeadMarkup();
    const cleanTitle = filename.replace(/\.pdf$/i, '');
    const printCss = `
      @page {
        size: A4 portrait;
        margin: ${PASSPORT_MARGIN_MM}mm;
      }

      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
      }

      body {
        color: hsl(224 71.4% 4.1%);
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      [data-passport-print-shell="true"] {
        width: 100%;
        max-width: none;
        margin: 0 auto;
        padding: 0;
      }

      [data-passport-print-root="true"] {
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        background: #ffffff !important;
      }

      [data-passport-print-section="true"] {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }

      [data-passport-print-root="true"] > *:first-child,
      [data-passport-print-root="true"] > *:last-child {
        break-inside: avoid-page;
        page-break-inside: avoid;
      }

      @media print {
        body {
          background: #ffffff !important;
        }
      }
    `;

    printWindow.document.open();
    printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <base href="${window.location.origin}" />
    <title>${cleanTitle}</title>
    ${styleMarkup}
    <style>${printCss}</style>
  </head>
  <body>
    <div data-pdf-export="true" data-passport-print-shell="true">
      ${clone.outerHTML}
    </div>
  </body>
</html>`);
    printWindow.document.close();

    await waitForPrintableDocument(printWindow.document);
    printWindow.addEventListener(
      'afterprint',
      () => {
        printWindow.close();
      },
      { once: true }
    );
    printWindow.focus();
    printWindow.print();
  } finally {
    window.setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.close();
      }
    }, 1500);
  }
}
