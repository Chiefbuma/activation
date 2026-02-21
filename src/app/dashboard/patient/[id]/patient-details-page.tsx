'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Registration, User, Corporate, Vital, Nutrition, Goal, Clinical } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  ArrowLeft,
  HeartPulse,
  Scale,
  Target,
  User as UserIcon,
  Cake,
  Phone,
  Mail,
  Building2,
  Binary,
  PlusCircle,
  Save,
  XCircle,
  FileText,
  Loader2,
  CalendarDays,
  Trash2,
  Edit,
  History,
  CheckCircle,
  Stethoscope,
  Activity,
  Clock,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReportViewer from '@/components/report-viewer';
import { motion } from 'framer-motion';

const DetailItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <div className="flex items-start gap-4">
    {Icon && (
      <div className="bg-muted/50 rounded-full p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    )}
    <div className="grid gap-0.5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="font-semibold text-foreground break-words">{value || '-'}</p>
    </div>
  </div>
);

export default function PatientDetailsPage({ initialPatient }: { initialPatient: Registration }) {
  const router = useRouter();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Registration>(initialPatient);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

  // Vitals State
  const [vitalsForm, setVitalsForm] = useState<Partial<Vital>>({ bp_systolic: 0, bp_diastolic: 0, pulse: 0, temp: 0, rbs: '' });
  
  // Nutrition State
  const [nutritionForm, setNutritionForm] = useState<Partial<Nutrition>>({ height: 0, weight: 0, bmi: 0, visceral_fat: 0, body_fat_percent: 0, notes_nutritionist: '' });

  // Goals State
  const [goalForm, setGoalForm] = useState<Partial<Goal>>({ discussion: '', goal: '' });

  // Clinical Review State
  const [clinicalForm, setClinicalReviewForm] = useState<Partial<Clinical>>({ notes_doctor: '', notes_psychologist: '' });

  const handleSaveVitals = () => {
    const newVital: Vital = {
        id: Date.now(),
        registration_id: patient.id,
        ...vitalsForm,
        measured_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        user_id: currentUser?.id || null
    } as Vital;
    setPatient(prev => ({ ...prev, vitals: [newVital, ...prev.vitals] }));
    toast({ title: 'Success', description: 'Vitals recorded.' });
  }

  const handleSaveNutrition = () => {
    const newNutri: Nutrition = {
        id: Date.now(),
        registration_id: patient.id,
        ...nutritionForm,
        created_at: new Date().toISOString(),
        user_id: currentUser?.id || null
    } as Nutrition;
    setPatient(prev => ({ ...prev, nutritions: [newNutri, ...prev.nutritions] }));
    toast({ title: 'Success', description: 'Nutrition recorded.' });
  }

  const handleSaveGoal = () => {
    const newGoal: Goal = {
        id: Date.now(),
        registration_id: patient.id,
        ...goalForm,
        created_at: new Date().toISOString(),
        user_id: currentUser?.id || null
    } as Goal;
    setPatient(prev => ({ ...prev, goals: [newGoal, ...prev.goals] }));
    toast({ title: 'Success', description: 'Goal recorded.' });
  }

  const handleSaveClinical = () => {
    const newClinical: Clinical = {
        id: Date.now(),
        registration_id: patient.id,
        ...clinicalForm,
        created_at: new Date().toISOString(),
        user_id: currentUser?.id || null
    } as Clinical;
    setPatient(prev => ({ ...prev, clinicals: [newClinical, ...prev.clinicals] }));
    toast({ title: 'Success', description: 'Clinical review recorded.' });
  }

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight">{`${
                patient.first_name
              } ${patient.surname || ''}`}</h1>
              <p className="text-muted-foreground">
                Participant Activation Details
              </p>
            </div>
          </div>
          <Badge className={patient.status === 'Active' ? 'bg-green-500/20 text-green-700' : 'bg-amber-500/20 text-amber-700'}>
            {patient.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="flex flex-col items-center text-center gap-4">
                <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                   {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={patient.first_name} />}
                  <AvatarFallback className="text-3xl">{patient.first_name[0]}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <CardTitle className="text-2xl">{`${patient.first_name} ${patient.surname || ''}`}</CardTitle>
                  <CardDescription>ID: {patient.id}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                 <Separator />
                <div className="grid grid-cols-1 gap-4 pt-4">
                  <DetailItem icon={UserIcon} label="Full Name" value={`${patient.first_name} ${patient.middle_name || ''} ${patient.surname || ''}`} />
                  <DetailItem icon={Cake} label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString() : '-'} />
                  <DetailItem icon={Binary} label="Age / Sex" value={`${patient.age} / ${patient.sex}`} />
                  <DetailItem icon={Phone} label="Phone" value={patient.phone} />
                  <DetailItem icon={Mail} label="Email" value={patient.email} />
                  <DetailItem icon={Building2} label="Corporate" value={patient.corporate_name} />
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><History className="h-5 w-5"/> Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <div>
                            <p className="text-sm font-medium">Registered</p>
                            <p className="text-xs text-muted-foreground">{new Date(patient.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    {patient.clinicals.length > 0 && (
                        <div className="flex gap-3">
                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <div>
                                <p className="text-sm font-medium">Clinical Review Conducted</p>
                                <p className="text-xs text-muted-foreground">{new Date(patient.clinicals[0].created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => setIsEditModalOpen(true)}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                <Button onClick={() => setIsReportModalOpen(true)}><FileText className="mr-2 h-4 w-4" /> Generate Report</Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Vitals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <HeartPulse className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Vital Signs</CardTitle>
                        <CardDescription>Latest physiological measurements</CardDescription>
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Record Vitals</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>New Vital Signs</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2"><Label>Systolic</Label><Input type="number" onChange={e => setVitalsForm({...vitalsForm, bp_systolic: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label>Diastolic</Label><Input type="number" onChange={e => setVitalsForm({...vitalsForm, bp_diastolic: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label>Pulse</Label><Input type="number" onChange={e => setVitalsForm({...vitalsForm, pulse: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label>Temp</Label><Input type="number" step="0.1" onChange={e => setVitalsForm({...vitalsForm, temp: parseFloat(e.target.value)})}/></div>
                            <div className="col-span-2 space-y-2"><Label>RBS</Label><Input onChange={e => setVitalsForm({...vitalsForm, rbs: e.target.value})}/></div>
                        </div>
                        <DialogFooter><DialogClose asChild><Button onClick={handleSaveVitals}>Save Record</Button></DialogClose></DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.vitals.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl">
                        <DetailItem label="BP" value={`${patient.vitals[0].bp_systolic}/${patient.vitals[0].bp_diastolic}`} />
                        <DetailItem label="Pulse" value={`${patient.vitals[0].pulse} bpm`} />
                        <DetailItem label="Temp" value={`${patient.vitals[0].temp}°C`} />
                        <DetailItem label="RBS" value={patient.vitals[0].rbs} />
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">No vitals recorded.</p>}
              </CardContent>
            </Card>

            {/* Nutrition */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Nutrition Assessment</CardTitle>
                        <CardDescription>Body composition and metrics</CardDescription>
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Record Nutrition</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Nutrition Record</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" onChange={e => setNutritionForm({...nutritionForm, height: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" step="0.1" onChange={e => setNutritionForm({...nutritionForm, weight: parseFloat(e.target.value)})}/></div>
                            <div className="space-y-2"><Label>Visceral Fat</Label><Input type="number" onChange={e => setNutritionForm({...nutritionForm, visceral_fat: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label>Body Fat %</Label><Input type="number" step="0.1" onChange={e => setNutritionForm({...nutritionForm, body_fat_percent: parseFloat(e.target.value)})}/></div>
                            <div className="col-span-2 space-y-2"><Label>Notes</Label><Textarea onChange={e => setNutritionForm({...nutritionForm, notes_nutritionist: e.target.value})}/></div>
                        </div>
                        <DialogFooter><DialogClose asChild><Button onClick={handleSaveNutrition}>Save Record</Button></DialogClose></DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.nutritions.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-xl">
                            <DetailItem label="Height" value={`${patient.nutritions[0].height} cm`} />
                            <DetailItem label="Weight" value={`${patient.nutritions[0].weight} kg`} />
                            <DetailItem label="BMI" value={patient.nutritions[0].bmi} />
                            <DetailItem label="V. Fat" value={patient.nutritions[0].visceral_fat} />
                            <DetailItem label="B. Fat %" value={`${patient.nutritions[0].body_fat_percent}%`} />
                        </div>
                        {patient.nutritions[0].notes_nutritionist && <p className="text-sm italic">"{patient.nutritions[0].notes_nutritionist}"</p>}
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">No nutrition data recorded.</p>}
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Personalized Goals</CardTitle>
                        <CardDescription>Target outcomes and discussions</CardDescription>
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Set Goal</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>New Goal</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2"><Label>Discussion</Label><Textarea onChange={e => setGoalForm({...goalForm, discussion: e.target.value})}/></div>
                            <div className="space-y-2"><Label>Goal</Label><Textarea onChange={e => setGoalForm({...goalForm, goal: e.target.value})}/></div>
                        </div>
                        <DialogFooter><DialogClose asChild><Button onClick={handleSaveGoal}>Save Goal</Button></DialogClose></DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.goals.length > 0 ? (
                    <div className="space-y-4">
                        {patient.goals.map(g => (
                            <div key={g.id} className="p-4 border rounded-xl bg-background/50 space-y-2">
                                <p className="text-sm font-semibold text-primary">Goal: {g.goal}</p>
                                <p className="text-sm text-muted-foreground">Discussion: {g.discussion}</p>
                                <p className="text-xs text-muted-foreground pt-2">Created: {new Date(g.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">No goals defined.</p>}
              </CardContent>
            </Card>

            {/* Clinical Reviews */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Clinical Review</CardTitle>
                        <CardDescription>Professional observations and plans</CardDescription>
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Conduct Review</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>New Clinical Review</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2"><Label>Doctor's Notes</Label><Textarea onChange={e => setClinicalReviewForm({...clinicalForm, notes_doctor: e.target.value})}/></div>
                            <div className="space-y-2"><Label>Psychologist's Notes</Label><Textarea onChange={e => setClinicalReviewForm({...clinicalForm, notes_psychologist: e.target.value})}/></div>
                        </div>
                        <DialogFooter><DialogClose asChild><Button onClick={handleSaveClinical}>Submit Review</Button></DialogClose></DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.clinicals.length > 0 ? (
                    <div className="space-y-6">
                        {patient.clinicals.map(c => (
                            <div key={c.id} className="space-y-4">
                                <div className="p-4 border rounded-xl bg-background/50">
                                    <h4 className="font-semibold text-primary mb-2">Doctor's Plan</h4>
                                    <p className="text-sm text-foreground">{c.notes_doctor || '-'}</p>
                                </div>
                                <div className="p-4 border rounded-xl bg-background/50">
                                    <h4 className="font-semibold text-primary mb-2">Psychological Notes</h4>
                                    <p className="text-sm text-foreground">{c.notes_psychologist || '-'}</p>
                                </div>
                                <p className="text-xs text-muted-foreground text-right">Reviewed on: {new Date(c.created_at).toLocaleDateString()}</p>
                                <Separator />
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">No clinical reviews found.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
       {isReportModalOpen && (
        <ReportViewer
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          patient={patient as any}
          corporate={patient.corporate_id ? { id: patient.corporate_id, name: patient.corporate_name!, wellness_date: patient.wellness_date! } : null}
        />
      )}
    </div>
  );
}
