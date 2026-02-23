'use client';

import type { Registration, Corporate } from '@/lib/types';
import { format, parseISO, isValid } from 'date-fns';

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

const safeToFixed = (val: any, digits: number = 1) => {
    const n = parseFloat(val);
    return isNaN(n) ? '-' : n.toFixed(digits);
};

export default function Report({ patient, corporate }: ReportProps) {
  const latestVital = patient.vitals?.[0];
  const latestNutrition = patient.nutritions?.[0];
  const latestClinical = patient.clinicals?.[0];
  const latestGoal = patient.goals?.[0];

  // Date Priority Logic: Corporate Wellness Date > Clinical > Nutrition > Vitals > Fallback
  let reportDate: Date = new Date();
  if (corporate?.wellness_date && isValid(parseISO(corporate.wellness_date))) {
    reportDate = parseISO(corporate.wellness_date);
  } else if (patient.wellness_date && isValid(parseISO(patient.wellness_date))) {
    reportDate = parseISO(patient.wellness_date);
  } else if (latestClinical?.created_at) {
    reportDate = new Date(latestClinical.created_at);
  } else if (latestNutrition?.created_at) {
    reportDate = new Date(latestNutrition.created_at);
  } else if (latestVital?.created_at) {
    reportDate = new Date(latestVital.created_at);
  }

  const day = reportDate.getDate();
  const suffix = getDaySuffix(day);
  const formattedDate = `${format(reportDate, 'eeee, ')}${day}${suffix}${format(reportDate, ' MMMM yyyy')}`;

  const discussionParagraphs = [
    latestClinical?.doctor_notes?.trim(),
    latestClinical?.notes_psychologist?.trim(),
    latestNutrition?.notes_nutritionist?.trim()
  ].filter(Boolean) as string[];

  const lowerWeight = latestNutrition?.llw ? safeToFixed(latestNutrition.llw) : '53.3';
  const upperWeight = latestNutrition?.ulw ? safeToFixed(latestNutrition.ulw) : '74.0';

  const mainAssessor = patient.clinicals?.[0]?.user_id ? 'Taria Clinical Team' : 'Clinical Team';

  // Environment-Aware Branding
  const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  const logoPath = isProd ? '/images/wide2-wide2-logo.png' : '/images/wide2-logo.png';

  return (
    <div className="report-body-container">
      <div className="header">
        <img src={logoPath} alt="Taria Health Logo" className="logo" />
      </div>

      <div className="content-wrapper">
        <div className="content-area">
          <div className="title-container keep-together">
            <div className="report-title">INDIVIDUAL WELLNESS REPORT:</div>
            <div className="report-date">{formattedDate}</div>
          </div>

          <div className="patient-info keep-together">
            <span className="patient-name">{`${patient.first_name} ${patient.surname || ''}`}</span>
            <span className="patient-email">{patient.email || ''}</span>
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
                <div className="body-text screening-item">Temperature: {latestVital.temp} °C</div>
              )}
              {latestNutrition?.weight && (
                <div className="body-text screening-item">Weight: {latestNutrition.weight} kgs</div>
              )}
              {latestNutrition?.height && (
                <div className="body-text screening-item">Height: {latestNutrition.height} cm</div>
              )}
              {latestNutrition?.visceral_fat && (
                <div className="body-text screening-item">Visceral Fat: {latestNutrition.visceral_fat}</div>
              )}
            </div>
            
            <div className="screening-right">
              {latestNutrition?.bmi && (
                <div className="body-text screening-item">BMI: {safeToFixed(latestNutrition.bmi)}</div>
              )}
              {latestVital?.rbs && (
                <div className="body-text screening-item">Random Blood Sugar: {latestVital.rbs} mmol/L</div>
              )}
              {latestVital?.fbs && (
                <div className="body-text screening-item">Fasting Blood Sugar: {latestVital.fbs} mmol/L</div>
              )}
              {latestNutrition?.body_fat_percent && (
                <div className="body-text screening-item">Body fat percentage: {latestNutrition.body_fat_percent}%</div>
              )}
            </div>
          </div>

          <div className="keep-together">
            <div className="guidance-text body-text">
              Healthy weight for height range (kgs): {lowerWeight}kgs - {upperWeight}kgs
            </div>
            <div className="guidance-text body-text">Healthy Body fat % ranges: Men 18-24%, Women 24-31%</div>
            <div className="guidance-text body-text">Visceral fat range: Under 12</div>
            <div className="guidance-text body-text">Random Blood Sugar normal range: 6.9 - 7.8 mmol/L</div>
            <div className="guidance-text body-text">
              Fasting Blood Sugar: Below 5.6 mmol/L (Normal), 5.6-6.9 mmol/L (Prediabetes), Above 6.9 mmol/L (Diabetes range)
            </div>
          </div>

          <div className="section-assessor min-space-before">Assessed by: {mainAssessor}</div>

          {discussionParagraphs.length > 0 && (
            <>
              <div className="section-heading min-space-before">Discussion Summary</div>
              <div className="content-section">
                {discussionParagraphs.map((para, idx) => (
                  <div key={idx} className={`content-item ${idx > 0 ? 'min-space-before' : ''}`}>
                    {para}
                  </div>
                ))}
              </div>
            </>
          )}

          {latestGoal && (latestGoal.discussion || latestGoal.goal) && (
            <>
              <div className="section-heading min-space-before">Personalized Health Goal</div>
              <div className="content-section">
                {latestGoal.discussion && (
                  <div className="content-item">{latestGoal.discussion}</div>
                )}
                {latestGoal.goal && (
                  <div className="target-text keep-together">
                    Target: {latestGoal.goal.replace(/^target\s*:\s*/i, '')}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="doctor-signature keep-together min-space-before">
            <span className="doctor-prefix">Dr.</span> {mainAssessor}
          </div>

          <div className="footer-container min-space-before">
            <img src={logoPath} alt="Taria Health Footer" className="logo footer-logo" />
            <div className="footer-text">© {new Date().getFullYear()} Taria Health. All rights reserved.</div>
          </div>
          <div className="end-spacer"></div>
        </div>
      </div>
    </div>
  );
}