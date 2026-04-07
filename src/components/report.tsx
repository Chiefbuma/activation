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

  // Historical vitals tracking - semicolon list format
  const tempHistory = patient.vitals.map(v => v.temp).filter(Boolean).map(t => `${t}°C`).join('; ');
  const rbsHistory = patient.vitals.map(v => v.rbs).filter(Boolean).map(r => `${r} mmol/L`).join('; ');
  const fbsHistory = patient.vitals.map(v => v.fbs).filter(Boolean).map(f => `${f} mmol/L`).join('; ');

  const hasScreening = patient.vitals.length > 0 || latestNutrition?.weight;
  const hasClinical = latestClinical && (latestClinical.conclusion || latestClinical.doctor_notes);

  const outcomes = latestClinical?.conclusion ? latestClinical.conclusion.split(',').filter(Boolean) : [];
  const doctorNotes = latestClinical?.doctor_notes ? safeSplitLines(latestClinical.doctor_notes) : [];

  const mainDoctor = "Mymoona Mohammed"; 

  return (
    <div className="report-body-container bg-white">
      <div className="header border-b-2 border-primary/10 mb-8 pb-6">
          <img src="/images/taria-logo.png" alt="Taria Health" className="logo h-12 w-auto mb-2" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Wellness Assessment System</p>
      </div>

      <div className="content-wrapper">
        <div className="content-area">
          <div className="title-container keep-together flex justify-between items-baseline mb-6">
            <div className="report-title text-xl font-black text-primary uppercase">INDIVIDUAL WELLNESS REPORT</div>
            <div className="report-date text-sm font-bold text-slate-500">{formattedDate}</div>
          </div>

          <div className="patient-info keep-together mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span className="patient-name font-black text-lg text-slate-900 uppercase">
              {`${patient.first_name} ${patient.surname || ''}`}
            </span>
            {patient.email && <span className="block text-sm font-bold text-primary lowercase mt-1">{patient.email}</span>}
          </div>

          {hasScreening && (
            <div className="mb-8">
              <div className="section-heading text-sm font-black text-primary uppercase border-b border-primary/10 pb-2 mb-4">1. Screening Results</div>
              <div className="screening-grid grid grid-cols-2 gap-x-12 gap-y-2 mb-6">
                <div className="screening-left space-y-1">
                  {latestVital?.bp_systolic && (
                    <div className="body-text text-sm">Blood Pressure: <span className="font-bold">{latestVital.bp_systolic}/{latestVital.bp_diastolic} mmHg</span></div>
                  )}
                  {latestVital?.pulse && (
                    <div className="body-text text-sm">Pulse: <span className="font-bold">{latestVital.pulse} bpm</span></div>
                  )}
                  {tempHistory && (
                    <div className="body-text text-sm">Temperature: <span className="font-bold">{tempHistory};</span></div>
                  )}
                  {latestNutrition?.weight && (
                    <div className="body-text text-sm">Weight: <span className="font-bold">{latestNutrition.weight} kgs</span></div>
                  )}
                  {latestNutrition?.height && (
                    <div className="body-text text-sm">Height: <span className="font-bold">{latestNutrition.height} cm</span></div>
                  )}
                </div>
                <div className="screening-right space-y-1">
                  {latestNutrition?.bmi && (
                      <div className="body-text text-sm">BMI: <span className="font-bold">{latestNutrition.bmi}</span></div>
                  )}
                  {rbsHistory && (
                      <div className="body-text text-sm">Random Sugar: <span className="font-bold">{rbsHistory};</span></div>
                  )}
                  {fbsHistory && (
                      <div className="body-text text-sm">Fasting Sugar: <span className="font-bold">{fbsHistory};</span></div>
                  )}
                  {latestNutrition?.body_fat_percent && (
                      <div className="body-text text-sm">Body Fat: <span className="font-bold">{latestNutrition.body_fat_percent}%</span></div>
                  )}
                  {latestNutrition?.visceral_fat && (
                      <div className="body-text text-sm">Visceral Fat: <span className="font-bold">{latestNutrition.visceral_fat}</span></div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-xl space-y-1">
                  <div className="guidance-text text-[10px] font-bold text-primary uppercase">Reference Ranges</div>
                  <div className="text-[11px] text-slate-600 font-medium italic">Healthy Weight: 51.0 - 71.0 kgs • Visceral Fat: Under 12 • Healthy Body Fat: Men 18-24%, Women 24-31%</div>
              </div>
              <div className="section-assessor mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assessed by: {mainDoctor}</div>
            </div>
          )}

          {hasClinical && (
            <div className="mb-8">
              <div className="section-heading text-sm font-black text-primary uppercase border-b border-primary/10 pb-2 mb-4">2. Clinical Assessment</div>
              <div className="space-y-2 mb-6">
                  {latestClinical?.counselling_sessions === 'Recommended' && (
                      <div className="body-text text-sm italic text-destructive">Recommended physiological counselling support</div>
                  )}
                  {latestNutrition?.meal_plan === 'Recommended' && (
                      <div className="body-text text-sm italic text-primary">Recommended nutritional meal plan intervention</div>
                  )}
                  {outcomes.map((o, idx) => (
                      <div key={idx} className="body-text text-sm text-slate-700">{o}</div>
                  ))}
              </div>

              {doctorNotes.length > 0 && (
                <div className="mt-6">
                  <div className="section-heading text-sm font-black text-primary uppercase border-b border-primary/10 pb-2 mb-4">Clinical notes</div>
                  <div className="p-4 bg-slate-50 border-l-4 border-primary rounded-r-xl">
                      {doctorNotes.map((paragraph, index) => (
                          <div key={index} className="body-text text-sm text-slate-600 leading-relaxed text-justify mb-2">{paragraph}</div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-8">
            <div className="section-heading text-sm font-black text-primary uppercase border-b border-primary/10 pb-2 mb-4">3. Discussion Summary</div>
            <div className="body-text text-sm text-slate-600 leading-relaxed text-justify">
                This screening provides a professional standard wellness overview based on your latest recorded physiological data. No immediate critical interventions are required beyond those documented in Section 2. Follow-up reviews are encouraged annually or as advised by your physician.
            </div>
            <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-medium text-slate-500 italic text-justify">
                Disclaimer: This wellness screening provides a clinical snapshot of your health at the time of assessment and is intended for health monitoring. It does not constitute a full diagnostic evaluation.
            </div>
          </div>
        
          <div className="doctor-signature mt-12 pt-6 border-t border-slate-100 flex flex-col items-start">
              <div className="h-px w-48 bg-slate-200 mb-2" />
              <div className="font-black text-primary text-base">Dr. {mainDoctor}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medical Practitioner • Taria Health</div>
          </div>

          <div className="footer-container fixed bottom-8 left-12 right-12 flex justify-between items-center pt-6 border-t border-slate-100">
              <img src="/images/wide2-logo.png" alt="Taria Health" className="h-6 w-auto opacity-50" />
              <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">© {new Date().getFullYear()} Taria Health Assessment Platform</div>
          </div>
        </div>
      </div>
    </div>
  );
}
