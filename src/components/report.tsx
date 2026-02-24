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

  const isCounsellingRecommended = latestClinical?.counselling_sessions === 'Recommended';
  const isMealPlanRecommended = latestNutrition?.meal_plan === 'Recommended';

  const doctorNotes = [
    ...(latestClinical?.doctor_notes ? safeSplitLines(latestClinical.doctor_notes) : []),
    ...(latestClinical?.notes_psychologist ? safeSplitLines(latestClinical.notes_psychologist) : []),
  ];

  const mainDoctor = "Emily Carter"; 

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

          <div className="section-heading min-space-before">
            Screening Results
          </div>

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
              {latestVital?.temp && (
                <div className="body-text screening-item">
                  Temperature: {latestVital.temp}°C
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
              {latestVital?.rbs && (
                  <div className="body-text screening-item">
                      Random blood sugar: {latestVital.rbs} mmol/L
                  </div>
              )}
              {latestVital?.fbs && (
                  <div className="body-text screening-item">
                      Fasting blood sugar: {latestVital.fbs} mmol/L
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

          <div className="section-heading min-space-before">Wellness Check Conclusion</div>
          <div className="content-section">
              {isCounsellingRecommended && (
                  <div className="body-text content-item">Recommends physiological counselling</div>
              )}
              {isMealPlanRecommended && (
                  <div className="body-text content-item">Recommends Nutritional meal plan</div>
              )}
              {latestClinical?.conclusion && (
                  <div className="body-text content-item">{latestClinical.conclusion}</div>
              )}
          </div>

          <div className="section-heading min-space-before">Discussion Summary</div>
          <div className="content-section">
              {doctorNotes.length > 0 ? doctorNotes.map((paragraph, index) => (
                  <div key={index} className="body-text content-item italic">{paragraph}</div>
              )) : (
                  <div className="body-text content-item italic">No additional notes recorded.</div>
              )}
              
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
