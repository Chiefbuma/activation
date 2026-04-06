'use client';

import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Corporate, Registration } from '@/lib/types';
import { buildPartnerNarrative, getPartnerSnapshotMetrics } from '@/lib/dashboard-metrics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Download, Loader2, UsersRound } from 'lucide-react';
import { format } from 'date-fns';

type PartnerSnapshotViewProps = {
  patients: Registration[];
  corporates: Corporate[];
};

const formatPercent = (value: number | null) => (value === null ? 'N/A' : `${value.toFixed(1)}%`);

export default function PartnerSnapshotView({
  patients,
  corporates,
}: PartnerSnapshotViewProps) {
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedCorporateId, setSelectedCorporateId] = useState<string>(
    corporates[0]?.id?.toString() ?? ''
  );

  const selectedCorporate = useMemo(
    () => corporates.find((corporate) => corporate.id.toString() === selectedCorporateId) ?? null,
    [corporates, selectedCorporateId]
  );

  const metrics = useMemo(
    () => (selectedCorporate ? getPartnerSnapshotMetrics(patients, selectedCorporate) : null),
    [patients, selectedCorporate]
  );

  const handleDownloadPdf = async () => {
    if (!reportRef.current || !metrics) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;

      let imgWidth = pdfWidth;
      let imgHeight = imgWidth / ratio;

      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = imgHeight * ratio;
      }

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${metrics.corporate.name.toLowerCase().replace(/\s+/g, '-')}-partner-snapshot.pdf`);
    } catch (error) {
      console.error('PARTNER_SNAPSHOT_PDF_ERROR', error);
      toast({
        variant: 'destructive',
        title: 'PDF export failed',
        description: 'The partner snapshot could not be exported this time.',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (corporates.length === 0) {
    return (
      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Partner Snapshot</CardTitle>
          <CardDescription>Add a corporate partner to generate participation reports.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/10">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Partner Snapshot</CardTitle>
            <CardDescription>
              PDF-ready participation summary based on registered participants and expected turnout.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select value={selectedCorporateId} onValueChange={setSelectedCorporateId}>
              <SelectTrigger className="w-full min-w-[240px] bg-background">
                <SelectValue placeholder="Select partner" />
              </SelectTrigger>
              <SelectContent>
                {corporates.map((corporate) => (
                  <SelectItem key={corporate.id} value={corporate.id.toString()}>
                    {corporate.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleDownloadPdf} disabled={isDownloading || !metrics}>
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download PDF
            </Button>
          </div>
        </CardHeader>
      </Card>

      {metrics ? (
        <div ref={reportRef} className="overflow-hidden rounded-[28px] border border-primary/10 bg-white p-6 text-slate-900 shadow-sm md:p-10">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <Badge className="w-fit rounded-full bg-primary/10 px-4 py-1 text-primary hover:bg-primary/10">
                  {metrics.corporate.name}
                </Badge>
                <div className="space-y-2">
                  <h2 className="text-4xl font-semibold tracking-tight text-[#dc2626]">
                    Participation Snapshot
                  </h2>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600">
                    {buildPartnerNarrative(metrics)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3">
                <img
                  src="/images/taria-logo.png"
                  alt="Taria Health"
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                    Taria Health
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {metrics.corporate.wellness_date
                      ? format(new Date(metrics.corporate.wellness_date), 'dd MMM yyyy')
                      : 'Wellness date pending'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-0 overflow-hidden rounded-[26px] border border-[#31519a] lg:grid-cols-[1.1fr_1fr_1fr_1fr_1fr]">
              <SnapshotTile
                label="Total Participants"
                value={metrics.totalParticipants.toString()}
                filled
                subtitle={
                  metrics.expectedParticipants
                    ? `${metrics.totalParticipants} of ${metrics.expectedParticipants} expected`
                    : 'Expected participant count not set'
                }
              />
              <SnapshotTile
                label="Male"
                value={metrics.maleCount.toString()}
                subtitle={`Above 40yrs - ${metrics.maleAbove40}\n40yrs & below - ${metrics.maleBelowOrEqual40}`}
              />
              <SnapshotTile
                label="Female"
                value={metrics.femaleCount.toString()}
                subtitle={`Above 40yrs - ${metrics.femaleAbove40}\n40yrs & below - ${metrics.femaleBelowOrEqual40}`}
              />
              <SnapshotTile
                label="Average Age"
                value={metrics.averageAge?.toString() ?? 'N/A'}
                subtitle={`${metrics.screeningsCompleted} completed screenings`}
              />
              <SnapshotTile
                label="Turnout Rate"
                value={formatPercent(metrics.turnoutRate)}
                subtitle="Based on expected participants"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard
                title="Expected Participants"
                value={metrics.expectedParticipants?.toString() ?? 'Not set'}
              />
              <StatCard
                title="Completed Screenings"
                value={metrics.screeningsCompleted.toString()}
              />
              <StatCard
                title="Participation Status"
                value={
                  metrics.turnoutRate === null
                    ? 'Needs target'
                    : metrics.turnoutRate >= 90
                      ? 'Excellent'
                      : metrics.turnoutRate >= 75
                        ? 'Strong'
                        : metrics.turnoutRate >= 50
                          ? 'Moderate'
                          : 'Low'
                }
              />
            </div>

            {!metrics.expectedParticipants ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                Add <span className="font-semibold">Expected Participants</span> in
                Settings under Corporate Partners so the turnout rate can be calculated for this report.
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SnapshotTile({
  label,
  value,
  subtitle,
  filled = false,
}: {
  label: string;
  value: string;
  subtitle: string;
  filled?: boolean;
}) {
  return (
    <div
      className={`flex min-h-[220px] flex-col justify-end border-b border-[#31519a] px-6 py-8 lg:border-b-0 lg:border-r ${
        filled ? 'bg-[#31519a] text-white' : 'bg-white text-[#1e3a8a]'
      }`}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className={`text-lg font-medium ${filled ? 'text-white/90' : 'text-[#dc2626]'}`}>
            {label}
          </p>
          <p
            className={`whitespace-pre-line text-sm leading-6 ${
              filled ? 'text-white/70' : 'text-slate-500'
            }`}
          >
            {subtitle}
          </p>
        </div>
        <p className={`text-6xl font-light tracking-tight ${filled ? 'text-white' : 'text-[#1e3a8a]'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <p className="mt-3 flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <UsersRound className="h-5 w-5 text-primary" />
        {value}
      </p>
    </div>
  );
}
