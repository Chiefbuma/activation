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

export default function Report({ patient, corporate }: ReportProps) {
  const latestVital = patient.vitals?.[0];
  const latestNutrition = patient.nutritions?.[0];
  const latestClinical = patient.clinicals?.[0];

  const reportDate = patient.wellness_date ? new Date(patient.wellness_date) : null;

  let formattedDate: string;
  if (reportDate && !isNaN(reportDate.getTime())) {
    const day = reportDate.getDate();
    const suffix = getDaySuffix(day);
    formattedDate = `${format(reportDate, 'eeee, ')}${day}${suffix}${format(
      reportDate,
      ' MMMM yyyy'
    )}`;
  } else {
    formattedDate = format(new Date(), 'eeee, do MMMM yyyy');
  }

  // Concatenate history for specific metrics
  const tempHistory = patient.vitals.map(v => v.temp).filter(Boolean).map(t => `${t}°C`).join('; ');
  const rbsHistory = patient.vitals.map(v => v.rbs).filter(Boolean).map(r => `${r} mmol/L`).join('; ');
  const fbsHistory = patient.vitals.map(v => v.fbs).filter(Boolean).map(f => `${f} mmol/L`).join('; ');

  const hasScreening = patient.vitals.length > 0 || (latestNutrition?.weight);
  const hasNutrition = latestNutrition && (latestNutrition.meal_plan || latestNutrition.notes_nutritionist);
  const hasPsychosocial = latestClinical && (latestClinical.counselling_sessions === 'Recommended' || latestClinical.verbal_stress_rating);
  const hasClinical = latestClinical && (latestClinical.conclusion || latestClinical.doctor_notes);

  const outcomes = latestClinical?.conclusion ? latestClinical.conclusion.split(',').filter(Boolean) : [];
  const doctorNotes = latestClinical?.doctor_notes ? safeSplitLines(latestClinical.doctor_notes) : [];

  const mainDoctor = "Mymoona Mohammed"; 

  return (
    <div className="report-body-container bg-white">
      <div className="header">
          <img src="/images/taria-logo.png" alt="Taria Health" className="logo" />
      </div>
      <div className="content-wrapper">
        <div className="content-area">
          <div className="title-container keep-together">
            <div className="report-title">INDIVIDUAL WELLNESS REPORT:</div>
            <div className="report-date">{formattedDate}</div>
          </div>

          <div className="patient-info keep-together">
            <span className="patient-name">
              {`${patient.first_name} ${patient.surname || ''}`}
              {patient.email && ` : ${patient.email}`}
            </span>
          </div>

          {hasScreening && (
            <>
              <div className="section-heading min-space-before">Screening Results</div>
              <div className="screening-grid force-together">
                <div className="screening-left">
                  {latestVital?.bp_systolic && latestVital?.bp_diastolic && (
                    <div className="body-text screening-item">
                      Blood Pressure: {latestVital.bp_systolic}/{latestVital.bp_diastolic} mmHg
                    </div>
                  )}
                  {latestVital?.pulse && (
                    <div className="body-text screening-item">
                      Pulse: {latestVital.pulse} bpm
                    </div>
                  )}
                  {tempHistory && (
                    <div className="body-text screening-item">
                      Temperature: {tempHistory};
                    </div>
                  )}
                  {latestNutrition?.weight && (
                    <div className="body-text screening-item">
                      Weight: {latestNutrition.weight} kgs
                    </div>
                  )}
                  {latestNutrition?.height && (
                    <div className="body-text screening-item">
                      Height: {latestNutrition.height} cm
                    </div>
                  )}
                  {latestNutrition?.visceral_fat && (
                      <div className="body-text screening-item">Visceral Fat: {latestNutrition.visceral_fat}</div>
                  )}
                </div>
                <div className="screening-right">
                  {latestNutrition?.bmi && (
                      <div className="body-text screening-item">BMI: {latestNutrition.bmi}</div>
                  )}
                  {rbsHistory && (
                      <div className="body-text screening-item">
                          Random blood sugar: {rbsHistory};
                      </div>
                  )}
                  {fbsHistory && (
                      <div className="body-text screening-item">
                          Fasting blood sugar: {fbsHistory};
                      </div>
                  )}
                  {latestNutrition?.body_fat_percent && (
                      <div className="body-text screening-item">Body fat percentage: {latestNutrition.body_fat_percent}%</div>
                  )}
                </div>
              </div>

              <div className="keep-together">
                  <div className="guidance-text body-text">Healthy weight for height range (kgs): 51.0kgs - 71.0kgs</div>
                  <div className="guidance-text body-text">Healthy Body fat % ranges: Men 18-24%, Women 24-31%</div>
                  <div className="guidance-text body-text">Visceral fat range: Under 12</div>
              </div>
              <div className="section-assessor min-space-before">Assessed by: {mainDoctor}</div>
            </>
          )}

          {hasClinical && (
            <>
              <div className="section-heading min-space-before">Clinical Assessment</div>
              <div className="content-section">
                  {latestClinical?.counselling_sessions === 'Recommended' && (
                      <div className="body-text content-item">Recommends physiological counselling</div>
                  )}
                  {latestNutrition?.meal_plan === 'Recommended' && (
                      <div className="body-text content-item">Recommends Nutritional meal plan</div>
                  )}
                  {outcomes.map((o, idx) => (
                      <div key={idx} className="body-text content-item">{o}</div>
                  ))}
              </div>

              {doctorNotes.length > 0 && (
                <>
                  <div className="section-heading min-space-before">Clinical notes</div>
                  <div className="content-section">
                      {doctorNotes.map((paragraph, index) => (
                          <div key={index} className="body-text content-item">{paragraph}</div>
                      ))}
                  </div>
                </>
              )}
            </>
          )}

          <div className="section-heading min-space-before">Discussion Summary</div>
          <div className="content-section">
              <div className="body-text content-item">The screening provides a standard wellness overview based on your latest recorded physiology. No immediate critical interventions are required beyond those listed above.</div>
              <div className="mt-8 p-4 bg-gray-50 border border-gray-100 rounded text-[9pt] italic text-gray-500">
                  Disclaimer: This screening provides a snapshot of your health at the time of assessment and is not a diagnostic evaluation.
              </div>
          </div>
        
          <div className="doctor-signature keep-together min-space-before">
              <span className="doctor-prefix">Dr.</span> {mainDoctor}
          </div>

          <div className="footer-container">
              <img src="/images/wide2-logo.png" alt="Taria Health" className="logo" />
              <div className="footer-text">© {new Date().getFullYear()} Taria Health - Wellness Assessment System</div>
          </div>

          <div className="end-spacer"></div>
        </div>
      </div>
    </div>
  );
}
