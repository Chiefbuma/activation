import type { User, Corporate, Registration, Vital, Nutrition, Goal, Clinical } from './types';

export const users: User[] = [
    { id: 1, name: 'Taria Admin', email: 'admin@superadmin.com', role: 'admin', password: '$2b$10$W3a1ZyygMwNhyty8RnROH.7sfbVEAdO5qrHVNh./.vAn2346k.ClW' },
    { id: 2, name: 'buma', email: 'georgebuma.jb@gmail.com', role: 'staff', password: '$2a$10$8ojrbBVb8dsdeU000GPC.OJsZiDBVuaa03PkHcYiaHUK1v/6aWoim' },
];

export const corporates: Corporate[] = [
    { id: 1, name: 'Bio Food Products', wellness_date: '2025-09-29' },
    { id: 3, name: 'Taria', wellness_date: '2025-10-01' },
    { id: 5, name: 'NCBA', wellness_date: '2026-02-02' }
];

export const registrations: Omit<Registration, 'vitals' | 'nutritions' | 'goals' | 'clinicals' | 'status'>[] = [
    {
        id: 2,
        first_name: 'Tom',
        middle_name: 'Mbalala',
        surname: 'Wawire',
        sex: 'Male',
        dob: '1970-01-01',
        age: 55,
        phone: '729089363',
        email: 'tommbalala@20.com',
        corporate_id: 1,
        wellness_date: null,
        user_id: null,
        created_at: '2026-01-31 14:03:10'
    },
    {
        id: 3,
        first_name: 'Euticus',
        middle_name: 'Matumbi',
        surname: 'Muthuri',
        sex: 'Male',
        dob: '1991-01-01',
        age: 34,
        phone: '742025594',
        email: 'matumbieutychus@gmail.com',
        corporate_id: null,
        wellness_date: '2026-02-15',
        user_id: null,
        created_at: '2026-01-31 14:03:10'
    },
    {
        id: 4,
        first_name: 'Paul',
        middle_name: null,
        surname: 'Ratemo',
        sex: 'Male',
        dob: '1985-01-01',
        age: 40,
        phone: '743760460',
        email: 'paulratemo84@gmail.com',
        corporate_id: null,
        wellness_date: '2026-02-02',
        user_id: null,
        created_at: '2026-01-31 14:03:10'
    },
    {
        id: 5,
        first_name: 'Kingsley',
        middle_name: 'Matumbi',
        surname: 'Otieno',
        sex: 'Male',
        dob: '1976-01-01',
        age: 49,
        phone: '724785997',
        email: 'nyakrojala@gmail.com',
        corporate_id: 5,
        wellness_date: '2026-02-02',
        user_id: null,
        created_at: '2026-01-31 14:03:10'
    }
];

export const vitals: Vital[] = [
    { id: 2, registration_id: 2, bp_systolic: 150, bp_diastolic: 99, pulse: 62, temp: 36.4, rbs: '6.2', user_id: null, measured_at: '2026-01-31 14:03:10', created_at: '2026-01-31 14:03:10' },
    { id: 3, registration_id: 3, bp_systolic: 133, bp_diastolic: 81, pulse: 70, temp: 36.1, rbs: 'NOT SUPPORTED', user_id: null, measured_at: '2026-01-31 14:03:10', created_at: '2026-01-31 14:03:10' },
    { id: 4, registration_id: 4, bp_systolic: 135, bp_diastolic: 89, pulse: 74, temp: 37, rbs: '5.5', user_id: null, measured_at: '2026-01-31 14:03:10', created_at: '2026-01-31 14:03:10' },
    { id: 5, registration_id: 5, bp_systolic: 171, bp_diastolic: 118, pulse: 76, temp: 37, rbs: '5.8', user_id: null, measured_at: '2026-01-31 14:03:10', created_at: '2026-01-31 14:03:10' }
];

export const nutritions: Nutrition[] = [
    { id: 2, registration_id: 2, height: 175, weight: 84, bmi: 27, visceral_fat: null, body_fat_percent: null, notes_nutritionist: null, user_id: null, created_at: '2026-01-31 14:03:10' },
    { id: 3, registration_id: 3, height: 169, weight: 81, bmi: 28, visceral_fat: null, body_fat_percent: null, notes_nutritionist: 'ecouraged on excercise', user_id: null, created_at: '2026-01-31 14:03:10' },
    { id: 4, registration_id: 4, height: 181, weight: 74.8, bmi: 23, visceral_fat: 6, body_fat_percent: 18.5, notes_nutritionist: 'encouraged on exercise', user_id: null, created_at: '2026-01-31 14:03:10' },
    { id: 7, registration_id: 5, height: 45, weight: 23, bmi: 113.6, visceral_fat: 45, body_fat_percent: 12, notes_nutritionist: 'Nutritionist Notes', user_id: null, created_at: '2026-02-01 06:45:27' }
];

export const goals: Goal[] = [
    { id: 2, registration_id: 2, user_id: 1, discussion: 'Patient is concerned about his high blood pressure reading and wants to manage it better.', goal: 'Reduce daily sodium intake to under 2,300mg. Monitor blood pressure at home weekly and keep a log.', created_at: '2026-01-31 14:03:10' },
    { id: 4, registration_id: 3, user_id: 1, discussion: '8994', goal: '7884', created_at: '2026-02-01 06:43:48' },
    { id: 5, registration_id: 5, user_id: 1, discussion: 'Discussion', goal: 'Goal', created_at: '2026-02-01 06:45:49' }
];

export const clinicals: Clinical[] = [
    { id: 2, registration_id: 2, notes_psychologist: 'Patient is showing signs of anxiety related to his new diagnosis. Provided resources for stress management.', notes_doctor: 'Diagnosed with Stage 1 Hypertension. Prescribed Lisinopril 10mg. Advised on lifestyle modifications, particularly diet and exercise. Follow up in 1 month to check BP.', user_id: 1, created_at: '2026-01-31 14:03:10' },
    { id: 4, registration_id: 3, notes_psychologist: 'Psychologist\'s Notes', notes_doctor: 'Doctor\'s Notes', user_id: 1, created_at: '2026-02-01 06:44:04' },
    { id: 5, registration_id: 5, notes_psychologist: 'Psychologist\'s Notes', notes_doctor: 'Doctor\'s Notes', user_id: 1, created_at: '2026-02-01 06:45:58' }
];
