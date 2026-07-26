'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';

interface PDFExportButtonProps {
  targetId: string;
  filename: string;
  label?: string;
  variant?: 'default' | 'icon';
}

export default function PDFExportButton({ targetId, filename, label = 'Export PDF', variant = 'default' }: PDFExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const element = document.getElementById(targetId);
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleExport}
        disabled={exporting}
        title="Export as PDF"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all disabled:opacity-60"
      >
        {exporting ? (
          <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin" />
        ) : (
          <FileText size={12} />
        )}
        {exporting ? 'Exporting…' : 'PDF'}
      </button>
    );
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-600 bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all disabled:opacity-60"
    >
      {exporting ? (
        <div className="w-3 h-3 border border-muted-foreground border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download size={13} />
      )}
      {exporting ? 'Exporting…' : label}
    </button>
  );
}
