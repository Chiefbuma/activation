import type { Clinical, Corporate, Nutrition, Registration, Vital } from './types';

export type DistributionRow = {
  label: string;
  count: number;
  color: string;
};

export type PartnerSnapshotMetrics = {
  corporate: Corporate;
  participants: Registration[];
  totalParticipants: number;
  expectedParticipants: number | null;
  turnoutRate: number | null;
  maleCount: number;
  femaleCount: number;
  maleAbove40: number;
  maleBelowOrEqual40: number;
  femaleAbove40: number;
  femaleBelowOrEqual40: number;
  averageAge: number | null;
  screeningsCompleted: number;
};

const BLOOD_PRESSURE_COLORS = {
  Normal: '#16a34a',
  Elevated: '#f59e0b',
  'Hypertensive (Stage 1)': '#f97316',
  'Hypertension Stage 2': '#ef4444',
  'Hypertensive Crisis': '#991b1b',
} as const;

const BLOOD_SUGAR_COLORS = {
  Normal: '#16a34a',
  Prediabetic: '#f59e0b',
  Diabetic: '#dc2626',
} as const;

const BMI_COLORS = {
  Underweight: '#3b82f6',
  Normal: '#16a34a',
  Overweight: '#f59e0b',
  Obese: '#dc2626',
} as const;

const PULSE_COLORS = {
  Bradycardia: '#3b82f6',
  Normal: '#16a34a',
  Tachycardia: '#dc2626',
} as const;

const TEMPERATURE_COLORS = {
  'Below Normal': '#3b82f6',
  Normal: '#16a34a',
  Fever: '#dc2626',
} as const;

const VISCERAL_FAT_COLORS = {
  Healthy: '#16a34a',
  Borderline: '#f59e0b',
  High: '#dc2626',
} as const;

const BODY_FAT_COLORS = {
  'Below Range': '#3b82f6',
  'Healthy Range': '#16a34a',
  'Above Range': '#dc2626',
} as const;

const STRESS_COLORS = {
  Mild: '#16a34a',
  Moderate: '#f59e0b',
  High: '#dc2626',
} as const;

const parseNumeric = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const latestVital = (patient: Registration): Vital | undefined => patient.vitals?.[0];
const latestNutrition = (patient: Registration): Nutrition | undefined => patient.nutritions?.[0];
const latestClinical = (patient: Registration): Clinical | undefined => patient.clinicals?.[0];

export function getScreenedParticipants(patients: Registration[]) {
  return patients.filter(
    (patient) =>
      patient.vitals.length > 0 || patient.nutritions.length > 0 || patient.clinicals.length > 0
  );
}

export function buildDistribution(labels: readonly string[], values: Array<string | null>, palette: Record<string, string>) {
  return labels.map((label) => ({
    label,
    count: values.filter((value) => value === label).length,
    color: palette[label] ?? '#64748b',
  }));
}

export function classifyBloodPressure(vital?: Vital) {
  const systolic = vital?.bp_systolic ?? null;
  const diastolic = vital?.bp_diastolic ?? null;

  if (systolic === null || diastolic === null) return null;
  if (systolic >= 180 || diastolic >= 120) return 'Hypertensive Crisis';
  if (systolic >= 140 || diastolic >= 90) return 'Hypertension Stage 2';
  if (systolic >= 130 || diastolic >= 80) return 'Hypertensive (Stage 1)';
  if (systolic >= 120 && diastolic < 80) return 'Elevated';
  if (systolic < 120 && diastolic < 80) return 'Normal';
  return null;
}

export function classifyBloodSugar(vital?: Vital) {
  const fbs = parseNumeric(vital?.fbs);
  const rbs = parseNumeric(vital?.rbs);

  if (fbs !== null) {
    if (fbs < 5.6) return 'Normal';
    if (fbs < 7) return 'Prediabetic';
    return 'Diabetic';
  }

  if (rbs !== null) {
    if (rbs < 7.8) return 'Normal';
    if (rbs < 11.1) return 'Prediabetic';
    return 'Diabetic';
  }

  return null;
}

export function classifyBmi(nutrition?: Nutrition) {
  const bmi = nutrition?.bmi ?? null;
  if (bmi === null) return null;
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function classifyPulse(vital?: Vital) {
  const pulse = vital?.pulse ?? null;
  if (pulse === null) return null;
  if (pulse < 60) return 'Bradycardia';
  if (pulse <= 100) return 'Normal';
  return 'Tachycardia';
}

export function classifyTemperature(vital?: Vital) {
  const temp = vital?.temp ?? null;
  if (temp === null) return null;
  if (temp < 36) return 'Below Normal';
  if (temp <= 37.5) return 'Normal';
  return 'Fever';
}

export function classifyVisceralFat(nutrition?: Nutrition) {
  const visceralFat = nutrition?.visceral_fat ?? null;
  if (visceralFat === null) return null;
  if (visceralFat < 12) return 'Healthy';
  if (visceralFat <= 15) return 'Borderline';
  return 'High';
}

export function classifyBodyFat(nutrition: Nutrition | undefined, sex: Registration['sex']) {
  const bodyFat = nutrition?.body_fat_percent ?? null;
  if (bodyFat === null || !sex || sex === 'Other') return null;

  const healthyMin = sex === 'Male' ? 18 : 24;
  const healthyMax = sex === 'Male' ? 24 : 31;

  if (bodyFat < healthyMin) return 'Below Range';
  if (bodyFat <= healthyMax) return 'Healthy Range';
  return 'Above Range';
}

export function classifyStress(clinical?: Clinical) {
  const rating = clinical?.verbal_stress_rating ?? null;
  if (rating === null) return null;
  if (rating <= 3) return 'Mild';
  if (rating <= 7) return 'Moderate';
  return 'High';
}

export function getPassportOverview(patients: Registration[]) {
  const screenedParticipants = getScreenedParticipants(patients);

  return {
    screenedParticipants: screenedParticipants.length,
    bloodPressureCaptured: patients.filter((patient) => classifyBloodPressure(latestVital(patient)) !== null).length,
    bloodSugarCaptured: patients.filter((patient) => classifyBloodSugar(latestVital(patient)) !== null).length,
    bmiCaptured: patients.filter((patient) => classifyBmi(latestNutrition(patient)) !== null).length,
    clinicalReviewed: patients.filter((patient) => latestClinical(patient)).length,
    recommendedMealPlans: patients.filter(
      (patient) => latestNutrition(patient)?.meal_plan === 'Recommended'
    ).length,
    recommendedCounselling: patients.filter(
      (patient) => latestClinical(patient)?.counselling_sessions === 'Recommended'
    ).length,
  };
}

export function getPassportDistributions(patients: Registration[]) {
  return {
    bloodPressure: buildDistribution(
      Object.keys(BLOOD_PRESSURE_COLORS),
      patients.map((patient) => classifyBloodPressure(latestVital(patient))),
      BLOOD_PRESSURE_COLORS
    ),
    bloodSugar: buildDistribution(
      Object.keys(BLOOD_SUGAR_COLORS),
      patients.map((patient) => classifyBloodSugar(latestVital(patient))),
      BLOOD_SUGAR_COLORS
    ),
    bmi: buildDistribution(
      Object.keys(BMI_COLORS),
      patients.map((patient) => classifyBmi(latestNutrition(patient))),
      BMI_COLORS
    ),
    pulse: buildDistribution(
      Object.keys(PULSE_COLORS),
      patients.map((patient) => classifyPulse(latestVital(patient))),
      PULSE_COLORS
    ),
    temperature: buildDistribution(
      Object.keys(TEMPERATURE_COLORS),
      patients.map((patient) => classifyTemperature(latestVital(patient))),
      TEMPERATURE_COLORS
    ),
    visceralFat: buildDistribution(
      Object.keys(VISCERAL_FAT_COLORS),
      patients.map((patient) => classifyVisceralFat(latestNutrition(patient))),
      VISCERAL_FAT_COLORS
    ),
    bodyFat: buildDistribution(
      Object.keys(BODY_FAT_COLORS),
      patients.map((patient) => classifyBodyFat(latestNutrition(patient), patient.sex)),
      BODY_FAT_COLORS
    ),
    stress: buildDistribution(
      Object.keys(STRESS_COLORS),
      patients.map((patient) => classifyStress(latestClinical(patient))),
      STRESS_COLORS
    ),
    conclusionCounts: [
      {
        label: 'Healthy',
        count: patients.filter(
          (patient) => latestClinical(patient)?.conclusion === 'All results within healthy range'
        ).length,
        color: '#16a34a',
      },
      {
        label: 'Lifestyle changes',
        count: patients.filter(
          (patient) =>
            latestClinical(patient)?.conclusion === 'Healthy lifestyle changes recommended'
        ).length,
        color: '#f59e0b',
      },
      {
        label: 'Raised BP review',
        count: patients.filter(
          (patient) =>
            latestClinical(patient)?.conclusion ===
            'Medical Review recommended for raised blood pressure'
        ).length,
        color: '#dc2626',
      },
      {
        label: 'Raised sugar review',
        count: patients.filter(
          (patient) =>
            latestClinical(patient)?.conclusion ===
            'Medical Review recommended for raised blood sugar'
        ).length,
        color: '#7c3aed',
      },
      {
        label: 'Comprehensive check',
        count: patients.filter(
          (patient) =>
            latestClinical(patient)?.conclusion === 'Comprehensive check recommended'
        ).length,
        color: '#0f766e',
      },
    ] satisfies DistributionRow[],
  };
}

export function getPartnerSnapshotMetrics(
  patients: Registration[],
  corporate: Corporate
): PartnerSnapshotMetrics {
  const participants = patients.filter((patient) => patient.corporate_id === corporate.id);
  const maleParticipants = participants.filter((patient) => patient.sex === 'Male');
  const femaleParticipants = participants.filter((patient) => patient.sex === 'Female');
  const ageValues = participants
    .map((patient) => patient.age)
    .filter((age): age is number => typeof age === 'number' && Number.isFinite(age));
  const expectedParticipants =
    typeof corporate.expected_participants === 'number' && corporate.expected_participants > 0
      ? corporate.expected_participants
      : null;

  return {
    corporate,
    participants,
    totalParticipants: participants.length,
    expectedParticipants,
    turnoutRate: expectedParticipants
      ? Number(((participants.length / expectedParticipants) * 100).toFixed(1))
      : null,
    maleCount: maleParticipants.length,
    femaleCount: femaleParticipants.length,
    maleAbove40: maleParticipants.filter((patient) => (patient.age ?? 0) > 40).length,
    maleBelowOrEqual40: maleParticipants.filter((patient) => (patient.age ?? 0) <= 40).length,
    femaleAbove40: femaleParticipants.filter((patient) => (patient.age ?? 0) > 40).length,
    femaleBelowOrEqual40: femaleParticipants.filter((patient) => (patient.age ?? 0) <= 40).length,
    averageAge: ageValues.length
      ? Number((ageValues.reduce((sum, age) => sum + age, 0) / ageValues.length).toFixed(0))
      : null,
    screeningsCompleted: participants.filter(
      (patient) =>
        patient.vitals.length > 0 || patient.nutritions.length > 0 || patient.clinicals.length > 0
    ).length,
  };
}

export function buildPartnerNarrative(metrics: PartnerSnapshotMetrics) {
  if (!metrics.expectedParticipants) {
    return `The wellness day recorded ${metrics.totalParticipants} participants. Add the expected participant count in Settings so turnout rate can be calculated automatically for this partner snapshot.`;
  }

  const tone =
    metrics.turnoutRate !== null && metrics.turnoutRate >= 90
      ? 'excellent'
      : metrics.turnoutRate !== null && metrics.turnoutRate >= 75
        ? 'strong'
        : metrics.turnoutRate !== null && metrics.turnoutRate >= 50
          ? 'moderate'
          : 'developing';

  return `The wellness day achieved ${tone} participation for ${metrics.corporate.name}, with ${metrics.totalParticipants} staff taking part out of the ${metrics.expectedParticipants} expected participants.`;
}
