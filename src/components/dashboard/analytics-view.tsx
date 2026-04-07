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
} from "@/components/ui/popover";
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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-primary/10">
        <div className="w-full md:w-auto">
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isPopoverOpen}
                className="w-full md:w-[350px] justify-between bg-background font-normal"
              >
                {selectedCorporateId === "all"
                  ? "All Corporate Partners"
                  : corporates.find((c) => String(c.id) === selectedCorporateId)?.name}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
              <div className="flex items-center border-b px-3">
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
                      "flex items-center px-2 py-2 text-sm rounded-sm cursor-pointer hover:bg-accent",
                      selectedCorporateId === "all" && "bg-accent"
                    )}
                    onClick={() => {
                      setSelectedCorporateId("all");
                      setIsPopoverOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", selectedCorporateId === "all" ? "opacity-100" : "opacity-0")} />
                    All Corporate Partners
                  </div>
                  {filteredCorporateList.map((c) => (
                    <div
                      key={c.id}
                      className={cn(
                        "flex items-center px-2 py-2 text-sm rounded-sm cursor-pointer hover:bg-accent",
                        selectedCorporateId === String(c.id) && "bg-accent"
                      )}
                      onClick={() => {
                        setSelectedCorporateId(String(c.id));
                        setIsPopoverOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", selectedCorporateId === String(c.id) ? "opacity-100" : "opacity-0")} />
                      {c.name}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleDownloadPdf} disabled={isDownloading} className="w-full md:w-auto shadow-md">
          {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Download Passport PDF
        </Button>
      </div>

      <div ref={reportRef} className="bg-card p-8 md:p-12 rounded-[24px] border shadow-xl text-foreground space-y-8 max-w-[1000px] mx-auto transition-colors">
        <div className="flex flex-col items-center gap-6 border-b-2 border-primary/10 pb-8">
          <img src="/images/taria-logo.png" alt="Taria Health" className="w-[450px] h-auto dark:invert" />
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mt-1">
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

        <div className="pt-8 border-t border-primary/10">
          <div className="bg-muted/30 border border-primary/10 rounded-2xl p-6">
            <p className="text-[10px] text-muted-foreground italic leading-relaxed text-justify">
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
