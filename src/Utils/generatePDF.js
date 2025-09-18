// utils/generatePDF.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDF = async (elementId, filename = "document.pdf") => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with ID "${elementId}" not found!`);
    return;
  }

  try {
    // Capture the DOM node
    const canvas = await html2canvas(input, { 
      scale: 2,
      useCORS: true, // allow cross-origin images
      logging: false
    });

    // Convert canvas to base64 PNG
    const imgData = canvas.toDataURL("image/png");

    // Create jsPDF instance
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate new image dimensions
    const imgProps = {
      width: canvas.width,
      height: canvas.height
    };
    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);

    const imgWidth = imgProps.width * ratio;
    const imgHeight = imgProps.height * ratio;

    const x = (pdfWidth - imgWidth) / 2;
    const y = 10;

    // Add the image
    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

    // Save PDF
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
