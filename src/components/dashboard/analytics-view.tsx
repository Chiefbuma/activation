'use client';

import type { Corporate, Registration } from '@/lib/types';
import ClassificationSection from './classification-section';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  Apple,
  HeartPulse,
  ShieldPlus,
  Weight,
} from 'lucide-react';
import { getPassportDistributions, getPassportOverview } from '@/lib/dashboard-metrics';

interface AnalyticsViewProps {
  patients: Registration[];
  corporates: Corporate[];
}

export default function AnalyticsView({ patients, corporates }: AnalyticsViewProps) {
  const overview = getPassportOverview(patients);
  const distributions = getPassportDistributions(patients);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <OverviewCard
          icon={<Activity className="h-5 w-5 text-primary" />}
          label="Participants Screened"
          value={overview.screenedParticipants}
          helper="Participants with at least one screening record"
        />
        <OverviewCard
          icon={<HeartPulse className="h-5 w-5 text-primary" />}
          label="Blood Pressure Captured"
          value={overview.bloodPressureCaptured}
          helper="Latest systolic and diastolic values available"
        />
        <OverviewCard
          icon={<Apple className="h-5 w-5 text-primary" />}
          label="Blood Sugar Captured"
          value={overview.bloodSugarCaptured}
          helper="Based on latest FBS or RBS result"
        />
        <OverviewCard
          icon={<Weight className="h-5 w-5 text-primary" />}
          label="BMI Captured"
          value={overview.bmiCaptured}
          helper="Latest nutrition assessment with BMI"
        />
        <OverviewCard
          icon={<ShieldPlus className="h-5 w-5 text-primary" />}
          label="Clinical Reviews"
          value={overview.clinicalReviewed}
          helper={`${corporates.length} active corporate partners in the program`}
        />
      </div>

      <Card className="border-primary/10">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Taria Passport</CardTitle>
            <CardDescription>
              Screening-result dashboard built from the latest vitals, nutrition, and clinical assessments per participant.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Meal plans recommended: {overview.recommendedMealPlans}
            </Badge>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Counselling recommended: {overview.recommendedCounselling}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-2">
        <ClassificationSection
          title="Blood Pressure"
          description="Counts by blood pressure category using the latest systolic and diastolic values."
          rows={distributions.bloodPressure}
          measuredLabel="Participants with BP"
          note="Thresholds use standard adult cutoffs: normal, elevated, stage 1, stage 2, and hypertensive crisis."
        />
        <ClassificationSection
          title="Blood Sugar"
          description="Counts by glycaemic category using the latest fasting blood sugar, falling back to random blood sugar when fasting values are missing."
          rows={distributions.bloodSugar}
          measuredLabel="Participants with sugar result"
          note="FBS cutoffs: <5.6 normal, 5.6-6.9 prediabetic, 7.0+ diabetic. RBS cutoffs: <7.8 normal, 7.8-11.0 prediabetic, 11.1+ diabetic."
        />
        <ClassificationSection
          title="BMI"
          description="Latest BMI classification from the nutrition screening results."
          rows={distributions.bmi}
          measuredLabel="Participants with BMI"
          note="BMI cutoffs: underweight <18.5, normal 18.5-24.9, overweight 25-29.9, obese 30+."
        />
        <ClassificationSection
          title="Pulse"
          description="Heart-rate snapshot from the latest vital-sign measurements."
          rows={distributions.pulse}
          measuredLabel="Participants with pulse"
          note="Pulse categories: bradycardia <60 bpm, normal 60-100 bpm, tachycardia above 100 bpm."
        />
        <ClassificationSection
          title="Temperature"
          description="Temperature trends from the latest vital-sign entries."
          rows={distributions.temperature}
          measuredLabel="Participants with temperature"
          note="Temperature categories: below normal <36.0C, normal 36.0-37.5C, fever above 37.5C."
        />
        <ClassificationSection
          title="Stress Rating"
          description="Verbal stress ratings from the latest clinical review."
          rows={distributions.stress}
          measuredLabel="Participants with stress score"
          note="Stress bands: mild 1-3, moderate 4-7, high 8-10."
        />
        <ClassificationSection
          title="Visceral Fat"
          description="Nutrition-based body composition view from recorded visceral fat values."
          rows={distributions.visceralFat}
          measuredLabel="Participants with visceral fat"
          note="Suggested ranges: healthy under 12, borderline 12-15, high 16 and above."
        />
        <ClassificationSection
          title="Body Fat %"
          description="Sex-aware healthy-range comparison based on the latest body-fat percentage captured."
          rows={distributions.bodyFat}
          measuredLabel="Participants with body fat %"
          note="Healthy ranges follow the current report guidance: men 18-24% and women 24-31%."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Clinical Recommendations</CardTitle>
            <CardDescription>
              Recommended interventions and medical follow-up outcomes from the latest assessments.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <RecommendationCard
              title="Meal Plans Recommended"
              value={overview.recommendedMealPlans}
              helper="Participants flagged for nutrition follow-up"
            />
            <RecommendationCard
              title="Counselling Recommended"
              value={overview.recommendedCounselling}
              helper="Participants flagged for counselling support"
            />
            {distributions.conclusionCounts.map((item) => (
              <RecommendationCard
                key={item.label}
                title={item.label}
                value={item.count}
                helper="Latest clinical conclusion count"
                accentColor={item.color}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Other Sections To Surface</CardTitle>
            <CardDescription>
              Good next sections from the current form if you want to keep expanding the passport dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SuggestionBlock
              title="Department or location participation"
              description="If you capture department/site during onboarding, you can show turnout by department, top-performing teams, and low-engagement teams."
            />
            <SuggestionBlock
              title="Screening completion funnel"
              description="Show how many participants completed vitals, nutrition, clinical review, and full end-to-end screening."
            />
            <SuggestionBlock
              title="Risk trend by wellness date"
              description="Add a monthly trend for blood pressure, sugar, BMI, and counselling recommendations using wellness date or registration date."
            />
            <SuggestionBlock
              title="Referral outcomes"
              description="Track follow-up referrals such as medical review, nutrition counselling, and psychology support to show intervention uptake."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function OverviewCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <Card className="border-primary/10">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2">{icon}</div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        <div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RecommendationCard({
  title,
  value,
  helper,
  accentColor,
}: {
  title: string;
  value: number;
  helper: string;
  accentColor?: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: accentColor ?? '#16a34a' }}
        />
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">{helper}</p>
    </div>
  );
}

function SuggestionBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-primary/10 bg-background p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
