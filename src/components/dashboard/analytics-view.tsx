'use client';

import { useMemo, useRef, useState } from 'react';
import type { Corporate, Registration } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, Search, Check, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { exportPassportPdf } from '@/lib/pdf-export';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import PassportReport from './passport-report';

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

  const reportScopeLabel =
    selectedCorporateId === 'all'
      ? 'Cross-partner passport overview'
      : `${selectedCorporate?.name || 'Corporate partner'} passport overview`;
  const reportTitle =
    selectedCorporateId === 'all'
      ? 'All Corporate Partners'
      : selectedCorporate?.name || 'Corporate Partner';
  const reportDateLabel = `Wellness Date: ${
    selectedCorporate?.wellness_date
      ? format(new Date(selectedCorporate.wellness_date), 'dd MMM yyyy')
      : format(new Date(), 'dd MMM yyyy')
  }`;

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);
    try {
      await exportPassportPdf({
        element: reportRef.current,
        filename: `taria-passport-${selectedCorporate?.name.toLowerCase().replace(/\s+/g, '-') || 'aggregate'}-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        reportTitle,
        reportSubtitle: reportScopeLabel,
        reportDateLabel,
        corporateId: selectedCorporateId,
      });
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

      <div ref={reportRef}>
        <PassportReport patients={filteredPatients} selectedCorporate={selectedCorporate} />
      </div>
    </div>
  );
}
