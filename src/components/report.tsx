import type { Registration, Corporate } from '@/lib/types';
import { format } from 'date-fns';

type ReportProps = {
  patient: Registration;
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

export default function Report({ patient, corporate }: ReportProps) {
  const latestVital = patient.vitals?.[0];
  const latestNutrition = patient.nutritions?.[0];
  const latestClinical = patient.clinicals?.[0];

  const wellnessDate = patient.wellness_date ? new Date(patient.wellness_date) : null;

  let formattedDate: string;
  if (wellnessDate && !isNaN(wellnessDate.getTime())) {
    const day = wellnessDate.getDate();
    const suffix = getDaySuffix(day);
    formattedDate = `${format(wellnessDate, 'eeee, ')}${day}${suffix}${format(wellnessDate, ' MMMM yyyy')}`;
  } else {
    formattedDate = 'Date Not Available';
  }

  const clinicalDetails = [
    latestClinical?.conclusion && `Conclusion: ${latestClinical.conclusion}`,
    latestClinical?.counselling_sessions && `Counselling Status: ${latestClinical.counselling_sessions}${latestClinical.verbal_stress_rating ? ` (Stress Rating: ${latestClinical.verbal_stress_rating}/10)` : ''}`,
    latestClinical?.doctor_notes && `Observations: ${latestClinical.doctor_notes}`,
  ].filter(Boolean) as string[];

  // Patient specific range or default example
  const weightRangeStr = latestNutrition?.llw && latestNutrition?.ulw 
    ? `${latestNutrition.llw}kgs - ${latestNutrition.ulw}kgs`
    : '53.3kgs - 74.0kgs';

  return (
    <div className="report-body-container bg-white text-gray-800 flex flex-col min-h-screen">
      <div className="flex-grow">
        <div className="header">
            <img src="https://picsum.photos/seed/taria/450/60" alt="Taria Health Logo" className="logo" data-ai-hint="healthcare logo" />
        </div>
        <div className="content-wrapper">
          <div className="content-area">
            <div className="title-container keep-together">
              <div className="report-title">INDIVIDUAL ACTIVATION REPORT:</div>
              <div className="report-date">{formattedDate}</div>
            </div>

            <div className="patient-info keep-together">
              <span className="patient-name">
                {`${patient.first_name} ${patient.surname || ''}`}
                {patient.email && ` : ${patient.email}`}
              </span>
            </div>

            <div className="section-heading min-space-before">Screening Results</div>

            <div className="screening-grid force-together">
              <div className="screening-left">
                {latestVital?.bp_systolic && latestVital?.bp_diastolic && (
                  <div className="body-text screening-item">
                    Blood Pressure: {latestVital.bp_systolic}/{latestVital.bp_diastolic} mmHg
                  </div>
                )}
                {latestVital?.pulse && (
                  <div className="body-text screening-item">Pulse: {latestVital.pulse} bpm</div>
                )}
                {latestVital?.temp && (
                  <div className="body-text screening-item">Temperature: {latestVital.temp}°C</div>
                )}
                 {latestNutrition?.weight && (
                  <div className="body-text screening-item">Weight: {latestNutrition.weight} kgs</div>
                )}
                {latestNutrition?.height && (
                  <div className="body-text screening-item">Height: {latestNutrition.height} cm</div>
                )}
              </div>
              <div className="screening-right">
                {latestNutrition?.bmi && (
                    <div className="body-text screening-item">BMI: {latestNutrition.bmi}</div>
                )}
                {latestVital?.rbs && (
                    <div className="body-text screening-item">Random Blood Sugar: {latestVital.rbs}</div>
                )}
                {latestVital?.fbs && (
                    <div className="body-text screening-item">Fasting Blood Sugar: {latestVital.fbs}</div>
                )}
                {latestNutrition?.body_fat_percent && (
                    <div className="body-text screening-item">Body fat: {latestNutrition.body_fat_percent}%</div>
                )}
                {latestNutrition?.meal_plan && (
                    <div className="body-text screening-item">Meal Plan: {latestNutrition.meal_plan}</div>
                )}
              </div>
            </div>

            {/* Informational Guidance Section */}
            <div className="guidance-box keep-together">
                <p className="guidance-title">Target Health Indicators Reference:</p>
                <div className="guidance-content">
                    <p>• Healthy weight for height range: <span className="font-bold">{weightRangeStr}</span></p>
                    <p>• Healthy Body fat % ranges: Men <span className="font-bold">18-24%</span>, Women <span className="font-bold">24-31%</span></p>
                    <p>• Visceral fat range: <span className="font-bold">Under 12</span></p>
                </div>
            </div>

            {clinicalDetails.length > 0 && (
                <>
                    <div className="section-heading min-space-before">Clinical Summary</div>
                    <div className="content-section">
                        {clinicalDetails.map((detail, index) => (
                            <div key={index} className="content-item">{detail}</div>
                        ))}
                    </div>
                </>
            )}
          
            <div className="doctor-signature keep-together min-space-before">
                <span className="doctor-prefix">Assessed by Taria Clinical Team</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Report Footer */}
      <div className="report-footer keep-together min-space-before">
          <div className="footer-line"></div>
          <div className="footer-content">
              <img src="https://picsum.photos/seed/taria/250/40" alt="Taria Health Logo" className="footer-logo" data-ai-hint="healthcare logo" />
              <p className="footer-text">Official Wellness Activation Report &copy; {new Date().getFullYear()} Taria Health</p>
          </div>
      </div>
    </div>
  );
}
