'use client';

import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Corporate, Registration } from '@/lib/types';
import ClassificationSection from './classification-section';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Search, Check, ChevronsUpDown } from 'lucide-react';
import { getPassportDistributions } from '@/lib/dashboard-metrics';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AnalyticsViewProps {
  patients: Registration[];
  corporates: Corporate[];
}

export default function AnalyticsView({ patients, corporates }: AnalyticsViewProps) {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedCorporateId, setSelectedCorporateId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const filteredPatients = useMemo(() => {
    if (selectedCorporateId === 'all') return patients;
    return patients.filter(p => String(p.corporate_id) === selectedCorporateId);
  }, [patients, selectedCorporateId]);

  const selectedCorporate = useMemo(() => 
    corporates.find(c => String(c.id) === selectedCorporateId), 
  [corporates, selectedCorporateId]);

  const filteredCorporateList = useMemo(() => {
    return corporates.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [corporates, searchQuery]);

  const distributions = useMemo(() => getPassportDistributions(filteredPatients), [filteredPatients]);
  const reportScopeLabel =
    selectedCorporateId === 'all'
      ? 'Cross-partner passport overview'
      : `${selectedCorporate?.name || 'Corporate partner'} passport overview`;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false
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

      let imgWidth = pdfWidth - 10; 
      let imgHeight = imgWidth / ratio;

      if (imgHeight > (pdfHeight - 10)) {
        imgHeight = pdfHeight - 10;
        imgWidth = imgHeight * ratio;
      }

      pdf.addImage(imgData, 'PNG', 5, 5, imgWidth, imgHeight);
      pdf.save(`taria-passport-${selectedCorporate?.name.toLowerCase().replace(/\s+/g, '-') || 'aggregate'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('PDF_EXPORT_ERROR', error);
      toast({ variant: 'destructive', title: 'Export failed', description: 'Could not generate report.' });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-card/90 p-4 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.2)] backdrop-blur md:flex-row md:items-center md:justify-between md:p-5 dark:bg-card/90">
        <div className="min-w-0 flex-1">
          <div className="w-full md:max-w-[380px]">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={isPopoverOpen}
                  className="h-11 w-full justify-between rounded-2xl border-border/70 bg-background px-4 text-left text-sm font-medium shadow-sm dark:bg-card"
                >
                  {selectedCorporateId === 'all'
                    ? 'All Corporate Partners'
                    : selectedCorporate?.name}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[350px] rounded-2xl border-border/70 p-0 shadow-xl" align="start">
                <div className="flex items-center border-b border-border/70 px-3">
                  <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                  <Input
                    placeholder="Search corporate..."
                    className="h-10 w-full border-0 bg-transparent focus-visible:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-72">
                  <div className="p-1">
                    <div
                      className={cn(
                        'flex items-center rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent',
                        selectedCorporateId === 'all' && 'bg-accent'
                      )}
                      onClick={() => {
                        setSelectedCorporateId('all');
                        setIsPopoverOpen(false);
                      }}
                    >
                      <Check className={cn('mr-2 h-4 w-4', selectedCorporateId === 'all' ? 'opacity-100' : 'opacity-0')} />
                      All Corporate Partners
                    </div>
                    {filteredCorporateList.map((c) => (
                      <div
                        key={c.id}
                        className={cn(
                          'flex items-center rounded-sm px-2 py-2 text-sm cursor-pointer hover:bg-accent',
                          selectedCorporateId === String(c.id) && 'bg-accent'
                        )}
                        onClick={() => {
                          setSelectedCorporateId(String(c.id));
                          setIsPopoverOpen(false);
                        }}
                      >
                        <Check className={cn('mr-2 h-4 w-4', selectedCorporateId === String(c.id) ? 'opacity-100' : 'opacity-0')} />
                        {c.name}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 font-medium dark:bg-card">
              {reportScopeLabel}
            </span>
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 font-medium dark:bg-card">
              {filteredPatients.length} participants
            </span>
          </div>
        </div>
        <Button
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="h-11 w-full rounded-2xl px-5 text-sm shadow-md md:w-auto"
        >
          {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Download Passport PDF
        </Button>
      </div>

      <div ref={reportRef} className="mx-auto max-w-[1080px] space-y-8 rounded-[32px] border border-border/70 bg-card/95 p-6 text-foreground shadow-[0_28px_70px_-40px_rgba(15,23,42,0.24)] transition-colors md:p-10 dark:bg-card/95">
        <div className="flex flex-col items-center gap-5 border-b border-border/70 pb-8">
          <img src="/images/taria-logo.png" alt="Taria Health" className="h-auto w-full max-w-[340px] dark:invert md:max-w-[380px]" />
          <div className="space-y-2 text-center">
            <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
              {selectedCorporateId === 'all' ? 'All Corporate Partners' : selectedCorporate?.name || 'Corporate Partner'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Wellness Date: {selectedCorporate?.wellness_date ? format(new Date(selectedCorporate.wellness_date), 'dd MMM yyyy') : format(new Date(), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <ClassificationSection
            index={1}
            title="Age Distribution"
            description="Participant demographics by clinical age thresholds."
            rows={distributions.ageRange}
            measuredLabel="Total participants"
          />
          <ClassificationSection
            index={2}
            title="Blood Pressure"
            description="Hypertension screening based on latest systolic/diastolic readings."
            rows={distributions.bloodPressure}
            measuredLabel="Total BP screenings"
          />
          <ClassificationSection
            index={3}
            title="Blood Sugar"
            description="Glycaemic categorization (FBS/RBS tracked results)."
            rows={distributions.bloodSugar}
            measuredLabel="Total glucose screenings"
          />
          <ClassificationSection
            index={4}
            title="BMI Analysis"
            description="Body Mass Index distribution across the population."
            rows={distributions.bmi}
            measuredLabel="Total BMI calculations"
          />
          <ClassificationSection
            index={5}
            title="Heart Rate"
            description="Resting pulse rate classifications."
            rows={distributions.pulse}
            measuredLabel="Total pulse checks"
          />
          <ClassificationSection
            index={6}
            title="Body Temperature"
            description="Recorded physiological temperature ranges."
            rows={distributions.temperature}
            measuredLabel="Total thermal checks"
          />
          <ClassificationSection
            index={7}
            title="Visceral Fat"
            description="Internal body composition and metabolic risk view."
            rows={distributions.visceralFat}
            measuredLabel="Total visceral fat readings"
          />
          <ClassificationSection
            index={8}
            title="Body Fat Percentage"
            description="Sex-aware body composition distribution."
            rows={distributions.bodyFat}
            measuredLabel="Total body fat screenings"
          />
          <ClassificationSection
            index={9}
            title="Nutritional Interventions"
            description="Recommended meal plan support outcomes."
            rows={distributions.nutritionalOutcomes}
            measuredLabel="Total nutrition reviews"
          />
          <ClassificationSection
            index={10}
            title="Psychosocial Support"
            description="Counselling and mental wellness recommendations."
            rows={distributions.psychosocialOutcomes}
            measuredLabel="Total wellness reviews"
          />
        </div>

        <div className="border-t border-border/70 pt-8">
          <div className="rounded-[24px] border border-border/70 bg-muted/25 p-5 dark:bg-muted/20">
            <p className="text-[11px] leading-6 text-muted-foreground">
              This passport provides an aggregate view of health screenings conducted within the Taria Health framework. 
              The data points reflect the latest recorded physiology for each participant at the time of export. 
              Thresholds and classifications follow standard clinical guidelines for general population wellness screening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
