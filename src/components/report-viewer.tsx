'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Report from '@/components/report';
import type { Patient, Corporate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Printer, Mail, XCircle, Loader2 } from 'lucide-react';
import '../app/dashboard/patient/[id]/report/report.css';

type ReportViewerProps = {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  corporate: Corporate | null;
};

export default function ReportViewer({
  isOpen,
  onClose,
  patient,
  corporate,
}: ReportViewerProps) {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const reportElement = document.querySelector('.report-body-container');
    if (!reportElement) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not find report content to download.',
      });
      return;
    }
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportElement as HTMLElement, {
        scale: 2,
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;

      let imgWidth = pdfWidth;
      let imgHeight = imgWidth / ratio;

      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = imgHeight * ratio;
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`wellness-report-${patient.first_name}-${patient.surname}.pdf`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error generating PDF',
        description: 'An unexpected error occurred.',
      });
      console.error('PDF Generation Error:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleEmail = () => {
    toast({
      title: 'Email Functionality',
      description: 'Emailing reports requires backend integration and is not yet implemented.',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="report-print-container max-w-5xl h-[95vh] flex flex-col p-0 border-none">
        <DialogHeader className="p-6 pb-2 no-print border-b bg-background">
          <DialogTitle>Patient Wellness Report</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden bg-muted/20">
          <ScrollArea className="h-full">
            <div className="py-8 px-4 sm:px-8">
              <Report patient={patient} corporate={corporate} />
            </div>
          </ScrollArea>
        </div>
        <DialogFooter className="p-6 pt-4 bg-background border-t sm:justify-between no-print">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              <XCircle className="mr-2 h-4 w-4" />
              Close
            </Button>
          </DialogClose>
          <div className="flex items-center gap-2">
            <Button onClick={handleEmail} variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Email Report
            </Button>
            <Button onClick={handleDownloadPdf} disabled={isDownloading}>
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Printer className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}