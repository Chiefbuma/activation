export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'navigator' | 'payer' | 'physician';
  avatarUrl?: string;
  password?: string;
  created_at?: string;
  updated_at?: string;
};

export type Corporate = {
  id: number;
  name: string;
  wellness_date: string;
  created_at?: string;
  updated_at?: string;
};

export type Vital = {
  id: number;
  registration_id: number;
  bp_systolic: number | null;
  bp_diastolic: number | null;
  pulse: number | null;
  temp: number | null;
  rbs: string | null;
  fbs: string | null;
  user_id: number | null;
  measured_at: string;
  created_at: string;
};

export type Nutrition = {
  id: number;
  registration_id: number;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  visceral_fat: number | null;
  body_fat_percent: number | null;
  meal_plan: 'Recommended' | 'Not Recommended' | null;
  notes_nutritionist: string | null;
  user_id: number | null;
  created_at: string;
};

export type Goal = {
  id: number;
  registration_id: number;
  user_id: number | null;
  discussion: string | null;
  goal: string | null;
  created_at: string;
};

export type Clinical = {
  id: number;
  registration_id: number;
  counselling_sessions: 'Recommended' | 'Not Recommended' | null;
  conclusion: 'All results within healthy range' | 'Healthy lifestyle changes recommended' | 'Comprehensive check recommended' | 'Medical Review recommended' | null;
  doctor_notes: string | null;
  wellness_check_type: 'Hypertension' | 'Diabetes' | 'None' | null;
  user_id: number | null;
  created_at: string;
};

export type Registration = {
  id: number;
  first_name: string;
  middle_name: string | null;
  surname: string | null;
  sex: 'Male' | 'Female' | 'Other' | null;
  dob: string | null;
  age: number | null;
  phone: string | null;
  email: string | null;
  corporate_id: number | null;
  wellness_date: string | null;
  user_id: number | null;
  created_at: string;
  
  // Joined/related data
  corporate_name?: string;
  vitals: Vital[];
  nutritions: Nutrition[];
  goals: Goal[];
  clinicals: Clinical[];
  
  // UI helper
  status: 'Active' | 'Pending';
};
