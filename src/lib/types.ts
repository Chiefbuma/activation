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
  weight: decimal(5,2) | null;
  bmi: decimal(5,2) | null;
  llw: decimal(5,2) | null;
  ulw: decimal(5,2) | null;
  excess_weight: decimal(5,2) | null;
  visceral_fat: int(11) | null;
  body_fat_percent: decimal(5,2) | null;
  meal_plan: 'Recommended' | 'Not Recommended' | null;
  weight_loss_period: string | null;
  user_id: number | null;
  created_at: string;
};

export type Clinical = {
  id: number;
  registration_id: number;
  counselling_sessions: 'Recommended' | 'Not Recommended' | null;
  verbal_stress_rating: int(11) | null;
  conclusion: 
    | 'All results within healthy range' 
    | 'Healthy lifestyle changes recommended' 
    | 'Comprehensive check recommended' 
    | 'Medical Review recommended for raised blood pressure' 
    | 'Medical Review recommended for raised blood sugar' 
    | null;
  doctor_notes: text | null;
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
