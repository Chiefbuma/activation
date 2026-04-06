import type { Clinical, Corporate, Nutrition, Registration, Vital } from './types';

export type DistributionRow = {
  label: string;
  count: number;
  maleCount: number;
  femaleCount: number;
  color: string;
};

export type PassportDistributions = {
  ageRange: DistributionRow[];
  bloodPressure: DistributionRow[];
  bloodSugar: DistributionRow[];
  bmi: DistributionRow[];
  pulse: DistributionRow[];
  temperature: DistributionRow[];
  stress: DistributionRow[];
  visceralFat: DistributionRow[];
  bodyFat: DistributionRow[];
  nutritionalOutcomes: DistributionRow[];
  psychosocialOutcomes: DistributionRow[];
  conclusionCounts: DistributionRow[];
};

const PALETTE = {
  Green: '#16a34a',
  Amber: '#f59e0b',
  Orange: '#f97316',
  Red: '#dc2626',
  DarkRed: '#991b1b',
  Blue: '#3b82f6',
  Purple: '#7c3aed',
  Teal: '#0f766e',
  Slate: '#64748b',
};

const latestVital = (p: Registration) => p.vitals?.[0];
const latestNutrition = (p: Registration) => p.nutritions?.[0];
const latestClinical = (p: Registration) => p.clinicals?.[0];

function classifyAge(p: Registration) {
  const age = p.age ?? 0;
  return age > 40 ? 'Above 40' : 'Below or Equal 40';
}

function classifyBP(p: Registration) {
  const v = latestVital(p);
  if (!v?.bp_systolic || !v?.bp_diastolic) return null;
  const { bp_systolic: s, bp_diastolic: d } = v;
  if (s >= 180 || d >= 120) return 'Hypertensive Crisis';
  if (s >= 140 || d >= 90) return 'Hypertension Stage 2';
  if (s >= 130 || d >= 80) return 'Hypertensive (Stage 1)';
  if (s >= 120 && d < 80) return 'Elevated';
  return 'Normal';
}

function classifySugar(p: Registration) {
  const v = latestVital(p);
  const val = parseFloat(v?.fbs || v?.rbs || '');
  if (isNaN(val)) return null;
  if (val < 5.6) return 'Normal';
  if (val < 7.0) return 'Prediabetic';
  return 'Diabetic';
}

function classifyBMI(p: Registration) {
  const n = latestNutrition(p);
  if (!n?.bmi) return null;
  if (n.bmi < 18.5) return 'Underweight';
  if (n.bmi < 25) return 'Normal';
  if (n.bmi < 30) return 'Overweight';
  return 'Obese';
}

function classifyPulse(p: Registration) {
  const v = latestVital(p);
  if (!v?.pulse) return null;
  if (v.pulse < 60) return 'Bradycardia';
  if (v.pulse <= 100) return 'Normal';
  return 'Tachycardia';
}

function classifyTemp(p: Registration) {
  const v = latestVital(p);
  if (!v?.temp) return null;
  if (v.temp < 36) return 'Below Normal';
  if (v.temp <= 37.5) return 'Normal';
  return 'Fever';
}

function classifyVisceral(p: Registration) {
  const n = latestNutrition(p);
  if (n?.visceral_fat === null || n?.visceral_fat === undefined) return null;
  if (n.visceral_fat < 12) return 'Healthy';
  if (n.visceral_fat <= 15) return 'Borderline';
  return 'High';
}

function classifyBodyFat(p: Registration) {
  const n = latestNutrition(p);
  if (!n?.body_fat_percent || !p.sex || p.sex === 'Other') return null;
  const min = p.sex === 'Male' ? 18 : 24;
  const max = p.sex === 'Male' ? 24 : 31;
  if (n.body_fat_percent < min) return 'Below Range';
  if (n.body_fat_percent <= max) return 'Healthy Range';
  return 'Above Range';
}

function classifyStress(p: Registration) {
  const c = latestClinical(p);
  if (c?.verbal_stress_rating === null || c?.verbal_stress_rating === undefined) return null;
  if (c.verbal_stress_rating <= 3) return 'Mild';
  if (c.verbal_stress_rating <= 7) return 'Moderate';
  return 'High';
}

function buildGenderDist(
  patients: Registration[],
  labels: string[],
  classifier: (p: Registration) => string | null,
  colorMap: Record<string, string>
): DistributionRow[] {
  return labels.map(label => {
    const matches = patients.filter(p => classifier(p) === label);
    return {
      label,
      count: matches.length,
      maleCount: matches.filter(p => p.sex === 'Male').length,
      femaleCount: matches.filter(p => p.sex === 'Female').length,
      color: colorMap[label] || PALETTE.Slate
    };
  });
}

export function getPassportDistributions(patients: Registration[]): PassportDistributions {
  return {
    ageRange: buildGenderDist(patients, ['Below or Equal 40', 'Above 40'], classifyAge, {
      'Below or Equal 40': PALETTE.Blue,
      'Above 40': PALETTE.Teal
    }),
    bloodPressure: buildGenderDist(patients, ['Normal', 'Elevated', 'Hypertensive (Stage 1)', 'Hypertension Stage 2', 'Hypertensive Crisis'], classifyBP, {
      'Normal': PALETTE.Green,
      'Elevated': PALETTE.Amber,
      'Hypertensive (Stage 1)': PALETTE.Orange,
      'Hypertension Stage 2': PALETTE.Red,
      'Hypertensive Crisis': PALETTE.DarkRed
    }),
    bloodSugar: buildGenderDist(patients, ['Normal', 'Prediabetic', 'Diabetic'], classifySugar, {
      'Normal': PALETTE.Green,
      'Prediabetic': PALETTE.Amber,
      'Diabetic': PALETTE.Red
    }),
    bmi: buildGenderDist(patients, ['Underweight', 'Normal', 'Overweight', 'Obese'], classifyBMI, {
      'Underweight': PALETTE.Blue,
      'Normal': PALETTE.Green,
      'Overweight': PALETTE.Amber,
      'Obese': PALETTE.Red
    }),
    pulse: buildGenderDist(patients, ['Bradycardia', 'Normal', 'Tachycardia'], classifyPulse, {
      'Bradycardia': PALETTE.Blue,
      'Normal': PALETTE.Green,
      'Tachycardia': PALETTE.Red
    }),
    temperature: buildGenderDist(patients, ['Below Normal', 'Normal', 'Fever'], classifyTemp, {
      'Below Normal': PALETTE.Blue,
      'Normal': PALETTE.Green,
      'Fever': PALETTE.Red
    }),
    stress: buildGenderDist(patients, ['Mild', 'Moderate', 'High'], classifyStress, {
      'Mild': PALETTE.Green,
      'Moderate': PALETTE.Amber,
      'High': PALETTE.Red
    }),
    visceralFat: buildGenderDist(patients, ['Healthy', 'Borderline', 'High'], classifyVisceral, {
      'Healthy': PALETTE.Green,
      'Borderline': PALETTE.Amber,
      'High': PALETTE.Red
    }),
    bodyFat: buildGenderDist(patients, ['Below Range', 'Healthy Range', 'Above Range'], classifyBodyFat, {
      'Below Range': PALETTE.Blue,
      'Healthy Range': PALETTE.Green,
      'Above Range': PALETTE.Red
    }),
    nutritionalOutcomes: buildGenderDist(patients, ['Recommended', 'Not Recommended'], p => latestNutrition(p)?.meal_plan ?? null, {
      'Recommended': PALETTE.Red,
      'Not Recommended': PALETTE.Green
    }),
    psychosocialOutcomes: buildGenderDist(patients, ['Recommended', 'Not Recommended'], p => latestClinical(p)?.counselling_sessions ?? null, {
      'Recommended': PALETTE.Red,
      'Not Recommended': PALETTE.Green
    }),
    conclusionCounts: buildGenderDist(patients, [
      'All results within healthy range',
      'Healthy lifestyle changes recommended',
      'Comprehensive check recommended',
      'Medical Review recommended for raised blood pressure',
      'Medical Review recommended for raised blood sugar'
    ], p => latestClinical(p)?.conclusion ?? null, {
      'All results within healthy range': PALETTE.Green,
      'Healthy lifestyle changes recommended': PALETTE.Amber,
      'Comprehensive check recommended': PALETTE.Teal,
      'Medical Review recommended for raised blood pressure': PALETTE.Red,
      'Medical Review recommended for raised blood sugar': PALETTE.Purple
    })
  };
}

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

export function getPartnerSnapshotMetrics(patients: Registration[], corporate: Corporate): PartnerSnapshotMetrics {
  const participants = patients.filter(p => p.corporate_id === corporate.id);
  const male = participants.filter(p => p.sex === 'Male');
  const female = participants.filter(p => p.sex === 'Female');
  const ages = participants.map(p => p.age).filter((a): a is number => typeof a === 'number');
  const expected = corporate.expected_participants ?? null;

  return {
    corporate,
    participants,
    totalParticipants: participants.length,
    expectedParticipants: expected,
    turnoutRate: expected ? (participants.length / expected) * 100 : null,
    maleCount: male.length,
    femaleCount: female.length,
    maleAbove40: male.filter(p => (p.age ?? 0) > 40).length,
    maleBelowOrEqual40: male.filter(p => (p.age ?? 0) <= 40).length,
    femaleAbove40: female.filter(p => (p.age ?? 0) > 40).length,
    femaleBelowOrEqual40: female.filter(p => (p.age ?? 0) <= 40).length,
    averageAge: ages.length ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : null,
    screeningsCompleted: participants.filter(p => p.vitals.length > 0 || p.nutritions.length > 0 || p.clinicals.length > 0).length
  };
}

export function buildPartnerNarrative(metrics: PartnerSnapshotMetrics) {
  if (!metrics.expectedParticipants) return `The wellness day recorded ${metrics.totalParticipants} participants. Set expected target in settings to calculate turnout.`;
  const tone = (metrics.turnoutRate ?? 0) >= 90 ? 'excellent' : (metrics.turnoutRate ?? 0) >= 75 ? 'strong' : 'moderate';
  return `The wellness day achieved ${tone} participation for ${metrics.corporate.name}, with ${metrics.totalParticipants} staff taking part out of ${metrics.expectedParticipants} expected.`;
}
