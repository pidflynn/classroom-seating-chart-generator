
import { LAYOUT_EDITOR_ID, SEATING_CHART_PDF_FILENAME } from '../constants';

declare const jspdf: any; // jspdf is loaded from CDN
declare const html2canvas: any; // html2canvas is loaded from CDN

export const exportLayoutAsPDF = async (className: string): Promise<void> => {
  const layoutElement = document.getElementById(LAYOUT_EDITOR_ID);
  if (!layoutElement) {
    alert("Could not find layout element to export.");
    return;
  }

  try {
    const canvas = await html2canvas(layoutElement, { 
        scale: 2, // Improve resolution
        useCORS: true, // If using external images (not relevant here but good practice)
        backgroundColor: '#ffffff' // Ensure background for transparent elements
    });
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate PDF dimensions
    // Using A4 size: 210mm x 297mm. JSPDF uses points (1pt = 1/72 inch, 1 inch = 25.4mm)
    const pdfWidth = 210; // mm
    const pdfHeight = 297; // mm
    
    // eslint-disable-next-line new-cap
    const pdf = new jspdf.jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4' // or [canvas.width * 25.4 / 96, canvas.height * 25.4 / 96] if custom size based on canvas
    });

    const imgProps= pdf.getImageProperties(imgData);
    const pdfCanvasWidth = pdf.internal.pageSize.getWidth();
    const pdfCanvasHeight = pdf.internal.pageSize.getHeight();

    const ratio = Math.min(pdfCanvasWidth / imgProps.width, pdfCanvasHeight / imgProps.height);
    const imgWidth = imgProps.width * ratio * 0.95; // Use 95% of width/height to add some margin
    const imgHeight = imgProps.height * ratio * 0.95;
    
    const xOffset = (pdfCanvasWidth - imgWidth) / 2;
    const yOffset = 15; // Top margin for title

    pdf.setFontSize(18);
    pdf.text(className, pdfCanvasWidth / 2, 10, { align: 'center' });
    
    pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidth, imgHeight);
    pdf.save(`${className.replace(/\s+/g, '_')}_${SEATING_CHART_PDF_FILENAME}`);

  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Check console for details.");
  }
};
