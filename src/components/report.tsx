import type { Patient, Corporate } from '@/lib/types';
import { format } from 'date-fns';

type ReportProps = {
  patient: Patient;
  corporate: Corporate | null;
};

function getDaySuffix(day: number) {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

const safeSplitLines = (text: string | null | undefined): string[] => {
  if (!text) return [];
  try {
    return String(text).match(/[^\r\n]+/g) || [];
  } catch {
    return [];
  }
};

const formatKgValue = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null;
  }

  return `${value.toFixed(2)}kgs`;
};

export default function Report({ patient, corporate }: ReportProps) {
  const latestVital = patient.vitals?.[0];
  const latestNutrition = patient.nutritions?.[0];
  const latestClinical = patient.clinicals?.[0];

  const reportDate = patient.wellness_date ? new Date(patient.wellness_date) : null;

  let formattedDate: string;
  if (reportDate && !isNaN(reportDate.getTime())) {
    const day = reportDate.getDate();
    const suffix = getDaySuffix(day);
    formattedDate = `${format(reportDate, 'eeee, ')}${day}${suffix}${format(reportDate, ' MMMM yyyy')}`;
  } else {
    formattedDate = format(new Date(), 'eeee, do MMMM yyyy');
  }

  const displayName = `${patient.first_name} ${patient.surname || ''}`.trim();
  const tempHistory = patient.vitals.map((v) => v.temp).filter(Boolean).map((t) => `${t}°C`).join('; ');
  const rbsHistory = patient.vitals.map((v) => v.rbs).filter(Boolean).map((r) => `${r} mmol/L`).join('; ');
  const fbsHistory = patient.vitals.map((v) => v.fbs).filter(Boolean).map((f) => `${f} mmol/L`).join('; ');
  const outcomes = latestClinical?.conclusion ? latestClinical.conclusion.split(',').map((item) => item.trim()).filter(Boolean) : [];
  const doctorNotes = latestClinical?.doctor_notes ? safeSplitLines(latestClinical.doctor_notes) : [];

  const mainDoctor = 'Mymoona Mohammed';
  const hasScreening = patient.vitals.length > 0 || latestNutrition?.weight;
  const hasNutritionAssessment = latestNutrition?.meal_plan === 'Recommended';
  const clinicalLines = [
    ...(latestClinical?.counselling_sessions === 'Recommended' ? ['Recommended physiological counselling support'] : []),
    ...outcomes,
    ...doctorNotes,
  ];
  const healthyWeightLower = formatKgValue(latestNutrition?.llw);
  const healthyWeightUpper = formatKgValue(latestNutrition?.ulw);
  const healthyWeightRange =
    healthyWeightLower && healthyWeightUpper
      ? `${healthyWeightLower} - ${healthyWeightUpper}`
      : null;

  return (
    <div className="report-body-container">
      <div className="header">
        <img src="/images/taria-logo.png" alt="PathCare and Taria Health" className="logo" />
      </div>

      <div className="content-wrapper">
        <div className="content-area">
          <div className="title-container keep-together">
            <div className="report-title">INDIVIDUAL WELLNESS REPORT:</div>
            <div className="report-date">{formattedDate}</div>
          </div>

          <div className="patient-info keep-together">
            <span className="patient-line">
              <span className="patient-name">{displayName}</span>
              {patient.email ? <span className="patient-email"> : {patient.email}</span> : null}
            </span>
          </div>

          {hasScreening && (
            <div className="report-section">
              <div className="section-heading">Screening Results</div>
              <div className="screening-grid">
                <div className="screening-left">
                  {latestVital?.bp_systolic ? (
                    <div className="body-text">Blood Pressure: <span className="report-strong">{latestVital.bp_systolic}/{latestVital.bp_diastolic} mmHg</span></div>
                  ) : null}
                  {latestVital?.pulse ? (
                    <div className="body-text">Pulse: <span className="report-strong">{latestVital.pulse} bpm</span></div>
                  ) : null}
                  {latestNutrition?.weight ? (
                    <div className="body-text">Weight: <span className="report-strong">{latestNutrition.weight} kgs</span></div>
                  ) : null}
                  {latestNutrition?.height ? (
                    <div className="body-text">Height: <span className="report-strong">{latestNutrition.height} cm</span></div>
                  ) : null}
                </div>
                <div className="screening-right">
                  {latestNutrition?.bmi ? (
                    <div className="body-text">BMI: <span className="report-strong">{latestNutrition.bmi}</span></div>
                  ) : null}
                  {latestNutrition?.visceral_fat ? (
                    <div className="body-text">Visceral Fat: <span className="report-strong">{latestNutrition.visceral_fat}</span></div>
                  ) : null}
                  {latestNutrition?.body_fat_percent ? (
                    <div className="body-text">Body Fat %: <span className="report-strong">{latestNutrition.body_fat_percent}%</span></div>
                  ) : null}
                  {tempHistory ? (
                    <div className="body-text">Temperature: <span className="report-strong">{tempHistory}</span></div>
                  ) : null}
                  {rbsHistory ? (
                    <div className="body-text">Random Sugar: <span className="report-strong">{rbsHistory}</span></div>
                  ) : null}
                  {fbsHistory ? (
                    <div className="body-text">Fasting Sugar: <span className="report-strong">{fbsHistory}</span></div>
                  ) : null}
                </div>
              </div>

              <div className="reference-box">
                {healthyWeightRange ? (
                  <div className="guidance-line">Your Recommended Healthy weight for height range is {healthyWeightRange}</div>
                ) : null}
                <div className="guidance-line">Recommended Healthy Body fat % ranges for Men 18-24%</div>
                <div className="guidance-line">Recommended Healthy Body fat % ranges for Women 24-31%</div>
                <div className="guidance-line">Recommended Visceral fat range: Under 12</div>
              </div>

              <div className="section-assessor">Assessed by: {mainDoctor}</div>
            </div>
          )}

          {hasNutritionAssessment && (
            <div className="report-section">
              <div className="section-heading">Nutritional Assessment</div>
              <div className="body-text">Nutritional meal plan recommended</div>
            </div>
          )}

          {clinicalLines.length > 0 && (
            <div className="report-section">
              <div className="section-heading">Clinical Assessment</div>
              <div className="clinical-outcomes">
                {clinicalLines.map((line, index) => (
                  <div key={index} className="body-text">{line}</div>
                ))}
              </div>
            </div>
          )}

          <div className="report-section">
            <div className="disclaimer-box">
              Disclaimer: This screening provides a snapshot of your health at the time of assessment and is not a diagnostic evaluation.
            </div>
          </div>

          <div className="doctor-signature">
            <div className="doctor-name">Dr. {mainDoctor}</div>
          </div>

          <div className="footer-container">
            <div className="footer-left">www.tariahealth.com</div>
            <div className="footer-center">FCB Mihrab - Mombasa KE | Phone: +254 722 847 188</div>
            <div className="footer-right">PROFESSIONAL CARE WITH GUIDANCE</div>
          </div>
        </div>
      </div>
    </div>
  );
}
