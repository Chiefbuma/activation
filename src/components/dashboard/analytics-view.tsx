'use client';

import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Corporate, Registration } from '@/lib/types';
import ClassificationSection from './classification-section';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, FileText } from 'lucide-react';
import { getPassportDistributions } from '@/lib/dashboard-metrics';

interface AnalyticsViewProps {
  patients: Registration[];
  corporates: Corporate[];
}

export default function AnalyticsView({ patients, corporates }: AnalyticsViewProps) {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const distributions = useMemo(() => getPassportDistributions(patients), [patients]);

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;

      let imgWidth = pdfWidth - 20; // Margin
      let imgHeight = imgWidth / ratio;

      if (imgHeight > (pdfHeight - 20)) {
        imgHeight = pdfHeight - 20;
        imgWidth = imgHeight * ratio;
      }

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`taria-passport-summary-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PASSPORT_PDF_ERROR', error);
      toast({
        variant: 'destructive',
        title: 'Export failed',
        description: 'Could not generate the passport PDF summary.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Program Health Passport</h2>
          <p className="text-sm text-muted-foreground">Comprehensive screening-result distribution report.</p>
        </div>
        <Button onClick={handleDownloadPdf} disabled={isDownloading} className="shadow-sm">
          {isDownloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download Passport PDF
        </Button>
      </div>

      <div ref={reportRef} className="bg-white p-6 md:p-10 rounded-[24px] border shadow-sm text-slate-900 space-y-8">
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1e3a8a]">Taria Passport Summary</h1>
              <p className="text-sm text-slate-500">Aggregate Screening Outcomes & Program Health Metrics</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">System Generated</p>
            <p className="text-sm font-semibold text-slate-700">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-10">
          <ClassificationSection
            index={1}
            title="Blood Pressure"
            description="Classification by latest systolic/diastolic readings."
            rows={distributions.bloodPressure}
            measuredLabel="Total with BP readings"
          />
          <ClassificationSection
            index={2}
            title="Blood Sugar"
            description="Glycaemic categories (FBS/RBS combined)."
            rows={distributions.bloodSugar}
            measuredLabel="Total with sugar results"
          />
          <ClassificationSection
            index={3}
            title="BMI"
            description="Body Mass Index distribution."
            rows={distributions.bmi}
            measuredLabel="Total with BMI calculated"
          />
          <ClassificationSection
            index={4}
            title="Pulse Rate"
            description="Resting heart rate classifications."
            rows={distributions.pulse}
            measuredLabel="Total with pulse captured"
          />
          <ClassificationSection
            index={5}
            title="Body Temperature"
            description="Recorded physiological temperature ranges."
            rows={distributions.temperature}
            measuredLabel="Total with temperature"
          />
          <ClassificationSection
            index={6}
            title="Stress Rating"
            description="Verbal stress scores from clinical reviews."
            rows={distributions.stress}
            measuredLabel="Total stress assessments"
          />
          <ClassificationSection
            index={7}
            title="Visceral Fat"
            description="Internal body composition view."
            rows={distributions.visceralFat}
            measuredLabel="Total visceral fat measurements"
          />
          <ClassificationSection
            index={8}
            title="Body Fat %"
            description="Sex-aware body fat percentage ranges."
            rows={distributions.bodyFat}
            measuredLabel="Total body fat % readings"
          />
          <ClassificationSection
            index={9}
            title="Nutritional Outcomes"
            description="Recommended meal plan interventions."
            rows={distributions.nutritionalOutcomes}
            measuredLabel="Total nutrition reviews"
          />
          <ClassificationSection
            index={10}
            title="Psychosocial Outcomes"
            description="Recommended counselling support."
            rows={distributions.psychosocialOutcomes}
            measuredLabel="Total psychosocial reviews"
          />
          <ClassificationSection
            index={11}
            title="Clinical Conclusions"
            description="Overall wellness screening determinations."
            rows={distributions.conclusionCounts}
            measuredLabel="Total clinical reviews"
          />
        </div>

        <div className="pt-8 border-t">
          <div className="bg-slate-50 border rounded-2xl p-4">
            <p className="text-[10pt] text-slate-500 italic leading-relaxed">
              Disclaimer: This dashboard provides an aggregate view of health screenings conducted within the Taria Health framework. 
              The results are based on the latest available data per participant at the time of report generation. 
              Thresholds follow standard clinical guidelines for general wellness screening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
