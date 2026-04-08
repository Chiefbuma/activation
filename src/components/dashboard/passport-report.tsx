import { format } from 'date-fns';
import type { Corporate, Registration } from '@/lib/types';
import ClassificationSection from './classification-section';
import { getPassportDistributions } from '@/lib/dashboard-metrics';

type PassportReportProps = {
  patients: Registration[];
  selectedCorporate?: Corporate | null;
  className?: string;
};

export default function PassportReport({
  patients,
  selectedCorporate,
  className,
}: PassportReportProps) {
  const distributions = getPassportDistributions(patients);
  const reportTitle = selectedCorporate?.name || 'All Corporate Partners';
  const reportDateLabel = `Wellness Date: ${
    selectedCorporate?.wellness_date
      ? format(new Date(selectedCorporate.wellness_date), 'dd MMM yyyy')
      : format(new Date(), 'dd MMM yyyy')
  }`;

  return (
    <div
      className={
        className ||
        'mx-auto max-w-[1080px] space-y-8 rounded-[32px] border border-border/70 bg-card/95 p-6 text-foreground shadow-[0_28px_70px_-40px_rgba(15,23,42,0.24)] transition-colors md:p-10 dark:bg-card/95'
      }
    >
      <div className="flex flex-col items-center gap-5 border-b border-border/70 pb-8">
        <img src="/images/taria-logo.png" alt="Taria Health" className="h-auto w-full max-w-[340px] md:max-w-[380px]" />
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            {reportTitle}
          </h2>
          <p className="text-sm text-muted-foreground">{reportDateLabel}</p>
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
  );
}
