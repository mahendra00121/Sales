import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (headers: string[], data: any[][], fileName: string, title: string) => {
  const doc = new jsPDF();
  
  // Add Title
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text(title, 14, 22);
  
  // Add Date
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
    styles: { fontSize: 8 },
  });

  doc.save(`${fileName}.pdf`);
};
