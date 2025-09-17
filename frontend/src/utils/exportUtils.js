// src/utils/exportUtils.js

// Export as TXT file
export const exportAsTXT = (content, filename = 'note') => {
  // Create blob with text content
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  
  // Create download link
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.txt`;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up object URL
  URL.revokeObjectURL(link.href);
};

// Export as PDF using jsPDF (simple text)
export const exportAsPDFSimple = (content, filename = 'note') => {
  // Dynamically import jsPDF
  import('jspdf').then((jsPDF) => {
    const doc = new jsPDF.jsPDF();
    
    // Split text into lines to fit PDF width
    const lines = doc.splitTextToSize(content, 180);
    
    // Add text to PDF
    doc.text(lines, 15, 15);
    
    // Save PDF
    doc.save(`${filename}.pdf`);
  }).catch((error) => {
    console.error('Error loading jsPDF:', error);
  });
};

// Export as PDF using html2pdf (formatted)
export const exportAsPDFFormatted = (elementId, filename = 'note') => {
  // Dynamically import html2pdf
  import('html2pdf.js').then((html2pdf) => {
    const element = document.getElementById(elementId);
    
    const options = {
      margin: 1,
      filename: `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf.default().set(options).from(element).save();
  }).catch((error) => {
    console.error('Error loading html2pdf:', error);
  });
};
