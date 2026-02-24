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
  llw: number | null;
  ulw: number | null;
  excess_weight: number | null;
  visceral_fat: number | null;
  body_fat_percent: number | null;
  meal_plan: 'Recommended' | 'Not Recommended' | null;
  weight_loss_period: string | null;
  notes_nutritionist?: string | null;
  user_id: number | null;
  created_at: string;
};

export type Clinical = {
  id: number;
  registration_id: number;
  counselling_sessions: 'Recommended' | 'Not Recommended' | null;
  verbal_stress_rating: number | null;
  conclusion: 
    | 'All results within healthy range' 
    | 'Healthy lifestyle changes recommended' 
    | 'Comprehensive check recommended' 
    | 'Medical Review recommended for raised blood pressure' 
    | 'Medical Review recommended for raised blood sugar' 
    | null;
  doctor_notes: string | null;
  notes_psychologist?: string | null;
  wellness_check_type?: string | null;
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
  
  // Related assessments
  vitals: Vital[];
  nutritions: Nutrition[];
  clinicals: Clinical[];
  
  // UI helper fields
  corporate_name?: string;
  status: 'Active' | 'Pending';
};

// Type alias for backward compatibility and semantic clarity
export type Patient = Registration;