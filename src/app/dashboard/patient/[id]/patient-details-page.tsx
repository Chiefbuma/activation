'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Registration, User, Vital, Nutrition, Goal, Clinical } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
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
  FileText,
  Stethoscope,
  Activity,
  Trash2,
  Edit,
  Loader2,
  BriefcaseMedical
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ReportViewer from '@/components/report-viewer';
import { corporates as mockCorporates } from '@/lib/mock-data';

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
        <Icon className="h-4 w-4 text-primary" />
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
  const { toast } = useToast();
  const [patient, setPatient] = useState<Registration>(initialPatient);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [corporates] = useState(mockCorporates);

  // Modal States
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isNutritionDialogOpen, setIsNutritionDialogOpen] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isClinicalDialogOpen, setIsClinicalDialogOpen] = useState(false);

  // Form States
  const [vitalsForm, setVitalsForm] = useState<Partial<Vital>>({});
  const [nutritionForm, setNutritionForm] = useState<Partial<Nutrition>>({});
  const [goalForm, setGoalForm] = useState<Partial<Goal>>({});
  const [clinicalForm, setClinicalForm] = useState<Partial<Clinical>>({});
  const [editFormData, setEditFormData] = useState<Partial<Registration>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fallback = `${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`;

  // CRUD Handlers
  const handleSaveVitals = () => {
    setIsSubmitting(true);
    setTimeout(() => {
        if (vitalsForm.id) {
            setPatient(prev => ({
                ...prev,
                vitals: prev.vitals.map(v => v.id === vitalsForm.id ? { ...v, ...vitalsForm } as Vital : v)
            }));
            toast({ title: 'Updated', description: 'Vitals record updated.' });
        } else {
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
        setIsSubmitting(false);
        setIsVitalsDialogOpen(false);
    }, 500);
  };

  const handleDeleteVital = (id: number) => {
    setPatient(prev => ({ ...prev, vitals: prev.vitals.filter(v => v.id !== id) }));
    toast({ title: 'Deleted', description: 'Vitals record removed.' });
  };

  const handleSaveNutrition = () => {
    setIsSubmitting(true);
    setTimeout(() => {
        if (nutritionForm.id) {
            setPatient(prev => ({
                ...prev,
                nutritions: prev.nutritions.map(n => n.id === nutritionForm.id ? { ...n, ...nutritionForm } as Nutrition : n)
            }));
            toast({ title: 'Updated', description: 'Nutrition record updated.' });
        } else {
            const newNutri: Nutrition = {
                id: Date.now(),
                registration_id: patient.id,
                ...nutritionForm,
                created_at: new Date().toISOString(),
                user_id: currentUser?.id || null
            } as Nutrition;
            setPatient(prev => ({ ...prev, nutritions: [newNutri, ...prev.nutritions] }));
            toast({ title: 'Success', description: 'Nutrition record saved.' });
        }
        setIsSubmitting(false);
        setIsNutritionDialogOpen(false);
    }, 500);
  };

  const handleDeleteNutrition = (id: number) => {
    setPatient(prev => ({ ...prev, nutritions: prev.nutritions.filter(n => n.id !== id) }));
    toast({ title: 'Deleted', description: 'Nutrition record removed.' });
  };

  const handleSaveGoal = () => {
    setIsSubmitting(true);
    setTimeout(() => {
        if (goalForm.id) {
            setPatient(prev => ({
                ...prev,
                goals: prev.goals.map(g => g.id === goalForm.id ? { ...g, ...goalForm } as Goal : g)
            }));
            toast({ title: 'Updated', description: 'Goal updated.' });
        } else {
            const newGoal: Goal = {
                id: Date.now(),
                registration_id: patient.id,
                ...goalForm,
                created_at: new Date().toISOString(),
                user_id: currentUser?.id || null
            } as Goal;
            setPatient(prev => ({ ...prev, goals: [newGoal, ...prev.goals] }));
            toast({ title: 'Success', description: 'Goal set successfully.' });
        }
        setIsSubmitting(false);
        setIsGoalDialogOpen(false);
    }, 500);
  };

  const handleDeleteGoal = (id: number) => {
    setPatient(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
    toast({ title: 'Deleted', description: 'Goal removed.' });
  };

  const handleSaveClinical = () => {
    setIsSubmitting(true);
    setTimeout(() => {
        if (clinicalForm.id) {
            setPatient(prev => ({
                ...prev,
                clinicals: prev.clinicals.map(c => c.id === clinicalForm.id ? { ...c, ...clinicalForm } as Clinical : c)
            }));
            toast({ title: 'Updated', description: 'Clinical review updated.' });
        } else {
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
        setIsSubmitting(false);
        setIsClinicalDialogOpen(false);
    }, 500);
  };

  const handleDeleteClinical = (id: number) => {
    setPatient(prev => ({ ...prev, clinicals: prev.clinicals.filter(c => c.id !== id) }));
    toast({ title: 'Deleted', description: 'Clinical review removed.' });
  };

  const handleOpenEditModal = () => {
    setEditFormData({
        ...patient,
        dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
        wellness_date: patient.wellness_date ? new Date(patient.wellness_date).toISOString().split('T')[0] : '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
        const updatedPatient = { ...patient, ...editFormData } as Registration;
        setPatient(updatedPatient);
        toast({ title: 'Success!', description: 'Participant details updated.' });
        setIsEditModalOpen(false);
        setIsSubmitting(false);
    }, 500);
  };

  const calculateAssessmentWeek = (date: string) => {
    const start = new Date(patient.created_at);
    const current = new Date(date);
    const diff = current.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 7)) + 1;
  };

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">
                {`${patient.first_name} ${patient.surname || ''}`}
              </h1>
              <p className="text-muted-foreground">Activation Details</p>
            </div>
          </div>
          <Badge variant="outline" className="text-base px-4 py-1 border-primary/30 text-primary bg-primary/5">
            Active Participant
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary/10">
              <CardHeader className="flex flex-col items-center text-center gap-4">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg rounded-full">
                  <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">{fallback}</AvatarFallback>
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
                  <DetailItem icon={Cake} label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'} />
                  <DetailItem icon={Binary} label="Age / Sex" value={`${patient.age || 'N/A'} / ${patient.sex}`} />
                  <DetailItem icon={Phone} label="Phone" value={patient.phone} />
                  <DetailItem icon={Mail} label="Email" value={patient.email} />
                  <DetailItem icon={Building2} label="Corporate" value={patient.corporate_name} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-primary/5">
              <CardHeader><CardTitle className="text-lg">Actions</CardTitle></CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start dark:text-foreground" onClick={handleOpenEditModal}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                <Button onClick={() => setIsReportModalOpen(true)} className="justify-start"><FileText className="mr-2 h-4 w-4" /> Generate Report</Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Vitals */}
            <Card className="border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <HeartPulse className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Vital Signs</CardTitle>
                        <CardDescription>Physiological measurements tracking</CardDescription>
                    </div>
                </div>
                <Dialog open={isVitalsDialogOpen} onOpenChange={(open) => { setIsVitalsDialogOpen(open); if (!open) setVitalsForm({}); }}>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Record Vitals</Button></DialogTrigger>
                    <DialogContent className="max-w-md border-primary/20">
                        <DialogHeader><DialogTitle className="text-primary">{vitalsForm.id ? 'Edit' : 'New'} Vital Signs</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2"><Label className="text-primary font-bold">Systolic (mmHg)</Label><Input type="number" value={vitalsForm.bp_systolic || ''} onChange={e => setVitalsForm({...vitalsForm, bp_systolic: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Diastolic (mmHg)</Label><Input type="number" value={vitalsForm.bp_diastolic || ''} onChange={e => setVitalsForm({...vitalsForm, bp_diastolic: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Pulse (bpm)</Label><Input type="number" value={vitalsForm.pulse || ''} onChange={e => setVitalsForm({...vitalsForm, pulse: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Temp (Optional °C)</Label><Input type="number" step="0.1" value={vitalsForm.temp || ''} onChange={e => setVitalsForm({...vitalsForm, temp: parseFloat(e.target.value)})}/></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">RBS (mmol/L) - Optional</Label><Input value={vitalsForm.rbs || ''} onChange={e => setVitalsForm({...vitalsForm, rbs: e.target.value})}/></div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold">FBS (mmol/L) - Optional</Label>
                                <Input value={vitalsForm.fbs || ''} placeholder="Below 5.6" onChange={e => setVitalsForm({...vitalsForm, fbs: e.target.value})}/>
                                <p className="text-[10px] text-muted-foreground">Range Below 5.6mmol/l</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="dark:text-foreground" onClick={() => setIsVitalsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveVitals} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Record
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.vitals.length > 0 ? (
                    <div className="space-y-4">
                        <div className="overflow-x-auto rounded-xl border border-primary/10">
                            <table className="min-w-full text-xs">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Date</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Week</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Value</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patient.vitals.map((v) => (
                                        <tr key={v.id} className="hover:bg-muted/30 group border-b border-primary/5">
                                            <td className="py-3 px-4">{new Date(v.measured_at).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">Week {calculateAssessmentWeek(v.measured_at)}</td>
                                            <td className="py-3 px-4 font-medium">
                                                {v.bp_systolic}/{v.bp_diastolic} BP, {v.pulse} Pulse
                                                {v.rbs && ` | RBS: ${v.rbs}`}
                                                {v.fbs && ` | FBS: ${v.fbs}`}
                                            </td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => { setVitalsForm(v); setIsVitalsDialogOpen(true); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteVital(v.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">No vitals recorded.</p>}
              </CardContent>
            </Card>

            {/* Nutrition */}
            <Card className="border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Nutrition Assessment</CardTitle>
                        <CardDescription>Body composition tracking</CardDescription>
                    </div>
                </div>
                <Dialog open={isNutritionDialogOpen} onOpenChange={(open) => { setIsNutritionDialogOpen(open); if (!open) setNutritionForm({}); }}>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Record Nutrition</Button></DialogTrigger>
                    <DialogContent className="max-w-md border-primary/20">
                        <DialogHeader><DialogTitle className="text-primary">{nutritionForm.id ? 'Edit' : 'New'} Nutrition Record</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2"><Label className="text-primary font-bold">Height (cm)</Label><Input type="number" value={nutritionForm.height || ''} onChange={e => setNutritionForm({...nutritionForm, height: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Weight (kg)</Label><Input type="number" step="0.1" value={nutritionForm.weight || ''} onChange={e => setNutritionForm({...nutritionForm, weight: parseFloat(e.target.value)})}/></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Visceral Fat</Label><Input type="number" value={nutritionForm.visceral_fat || ''} onChange={e => setNutritionForm({...nutritionForm, visceral_fat: parseInt(e.target.value)})}/></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Body Fat %</Label><Input type="number" step="0.1" value={nutritionForm.body_fat_percent || ''} onChange={e => setNutritionForm({...nutritionForm, body_fat_percent: parseFloat(e.target.value)})}/></div>
                            <div className="col-span-2 space-y-2">
                                <Label className="text-primary font-bold">Nutritionist Meal Plan</Label>
                                <Select value={nutritionForm.meal_plan || ''} onValueChange={(v) => setNutritionForm({...nutritionForm, meal_plan: v as any})}>
                                    <SelectTrigger><SelectValue placeholder="Select plan status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Recommended">Recommended</SelectItem>
                                        <SelectItem value="Not Recommended">Not Recommended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="col-span-2 space-y-2"><Label className="text-primary font-bold">Notes</Label><Textarea value={nutritionForm.notes_nutritionist || ''} onChange={e => setNutritionForm({...nutritionForm, notes_nutritionist: e.target.value})}/></div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="dark:text-foreground" onClick={() => setIsNutritionDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveNutrition} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Record
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.nutritions.length > 0 ? (
                    <div className="space-y-4">
                        <div className="overflow-x-auto rounded-xl border border-primary/10">
                            <table className="min-w-full text-xs">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Date</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Plan</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">Value</th>
                                        <th className="text-left py-3 px-4 font-medium text-muted-foreground border-b">BMI</th>
                                        <th className="text-right py-3 px-4 font-medium text-muted-foreground border-b">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patient.nutritions.map((n) => (
                                        <tr key={n.id} className="hover:bg-muted/30 group border-b border-primary/5">
                                            <td className="py-3 px-4">{new Date(n.created_at).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">
                                                <Badge variant={n.meal_plan === 'Recommended' ? 'default' : 'secondary'} className="text-[10px]">
                                                    {n.meal_plan || 'N/A'}
                                                </Badge>
                                            </td>
                                            <td className="py-3 px-4 font-medium">{n.weight}kg, {n.height}cm</td>
                                            <td className="py-3 px-4">{n.bmi || '-'}</td>
                                            <td className="py-3 px-4 text-right space-x-2">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => { setNutritionForm(n); setIsNutritionDialogOpen(true); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteNutrition(n.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">No nutrition data recorded.</p>}
              </CardContent>
            </Card>

            {/* Goals */}
            <Card className="border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Target className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Activation Goals</CardTitle>
                        <CardDescription>Target outcomes and discussion</CardDescription>
                    </div>
                </div>
                <Dialog open={isGoalDialogOpen} onOpenChange={(open) => { setIsGoalDialogOpen(open); if (!open) setGoalForm({}); }}>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Set Goal</Button></DialogTrigger>
                    <DialogContent className="max-w-md border-primary/20">
                        <DialogHeader><DialogTitle className="text-primary">{goalForm.id ? 'Edit' : 'New'} Health Goal</DialogTitle></DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2"><Label className="text-primary font-bold">Discussion Findings</Label><Textarea value={goalForm.discussion || ''} onChange={e => setGoalForm({...goalForm, discussion: e.target.value})}/></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Target Goal</Label><Textarea value={goalForm.goal || ''} onChange={e => setGoalForm({...goalForm, goal: e.target.value})}/></div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="dark:text-foreground" onClick={() => setIsGoalDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveGoal} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Goal
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.goals.length > 0 ? (
                    <div className="space-y-4">
                        {patient.goals.map(g => (
                            <div key={g.id} className="p-4 border border-primary/10 rounded-xl bg-primary/5 space-y-3 group relative">
                                <div className="absolute top-3 right-3 flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => { setGoalForm(g); setIsGoalDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteGoal(g.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Target Goal</p>
                                        <p className="text-sm font-semibold pr-16 text-foreground">{g.goal}</p>
                                    </div>
                                </div>
                                <Separator className="bg-primary/10" />
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Discussion</p>
                                    <p className="text-sm text-muted-foreground">{g.discussion}</p>
                                </div>
                                <p className="text-[10px] text-muted-foreground pt-2 italic">Set on {new Date(g.created_at).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">No goals defined.</p>}
              </CardContent>
            </Card>

            {/* Clinical Reviews */}
            <Card className="border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Clinical Review</CardTitle>
                        <CardDescription>Professional observations and plans</CardDescription>
                    </div>
                </div>
                <Dialog open={isClinicalDialogOpen} onOpenChange={(open) => { setIsClinicalDialogOpen(open); if (!open) setClinicalForm({}); }}>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Conduct Review</Button></DialogTrigger>
                    <DialogContent className="max-w-2xl border-primary/20">
                        <DialogHeader><DialogTitle className="text-primary">{clinicalForm.id ? 'Edit' : 'New'} Clinical Review</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2 col-span-2">
                                <Label className="text-primary font-bold">Wellness Check Conclusion</Label>
                                <Select value={clinicalForm.conclusion || ''} onValueChange={(v) => setClinicalForm({...clinicalForm, conclusion: v as any})}>
                                    <SelectTrigger><SelectValue placeholder="Select conclusion" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All results within healthy range">All results within healthy range</SelectItem>
                                        <SelectItem value="Healthy lifestyle changes recommended">Healthy lifestyle changes recommended</SelectItem>
                                        <SelectItem value="Comprehensive check recommended">Comprehensive check recommended</SelectItem>
                                        <SelectItem value="Medical Review recommended for raised blood pressure">Medical Review recommended for raised blood pressure</SelectItem>
                                        <SelectItem value="Medical Review recommended for raised blood sugar">Medical Review recommended for raised blood sugar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold">Counselling Sessions</Label>
                                <Select value={clinicalForm.counselling_sessions || ''} onValueChange={(v) => setClinicalForm({...clinicalForm, counselling_sessions: v as any})}>
                                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Recommended">Recommended</SelectItem>
                                        <SelectItem value="Not Recommended">Not Recommended</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold">Comprehensive Wellness Check</Label>
                                <Select value={clinicalForm.wellness_check_type || ''} onValueChange={(v) => setClinicalForm({...clinicalForm, wellness_check_type: v as any})}>
                                    <SelectTrigger><SelectValue placeholder="Select check type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hypertension">Hypertension</SelectItem>
                                        <SelectItem value="Diabetes">Diabetes</SelectItem>
                                        <SelectItem value="None">None</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 col-span-2">
                                <Label className="text-primary font-bold">Doctor's Notes</Label>
                                <Textarea className="min-h-[100px]" value={clinicalForm.doctor_notes || ''} placeholder="Enter doctor's observations..." onChange={e => setClinicalForm({...clinicalForm, doctor_notes: e.target.value})}/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" className="dark:text-foreground" onClick={() => setIsClinicalDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveClinical} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Review
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.clinicals.length > 0 ? (
                    <div className="space-y-6">
                        {patient.clinicals.map(c => (
                            <div key={c.id} className="space-y-4 p-4 border border-primary/10 rounded-xl bg-muted/20 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                <div className="absolute top-3 right-3 flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => { setClinicalForm(c); setIsClinicalDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteClinical(c.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Activity className="h-3 w-3" /> Conclusion
                                        </h4>
                                        <p className="text-sm text-foreground font-semibold">{c.conclusion || '-'}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <BriefcaseMedical className="h-3 w-3" /> Targeted Check
                                        </h4>
                                        <p className="text-sm text-foreground font-semibold">{c.wellness_check_type || 'None'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <UserIcon className="h-3 w-3" /> Counselling
                                        </h4>
                                        <Badge variant={c.counselling_sessions === 'Recommended' ? 'default' : 'secondary'} className="text-[10px]">
                                            {c.counselling_sessions || 'N/A'}
                                        </Badge>
                                    </div>
                                    <div className="col-span-2">
                                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Binary className="h-3 w-3" /> Doctor's Notes
                                        </h4>
                                        <p className="text-sm text-foreground leading-relaxed pr-16">{c.doctor_notes || '-'}</p>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Reviewed on: {new Date(c.created_at).toLocaleDateString()}</p>
                                </div>
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

      {/* Edit Participant Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-2xl border-primary/20">
            <DialogHeader>
                <DialogTitle className="text-primary">Edit Participant Details</DialogTitle>
                <CardDescription>Update the registration information below.</CardDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePatient}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-primary font-bold">First Name</Label>
                        <Input id="first_name" value={editFormData.first_name || ''} onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="middle_name" className="text-primary font-bold">Middle Name</Label>
                        <Input id="middle_name" value={editFormData.middle_name || ''} onChange={(e) => setEditFormData({...editFormData, middle_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="surname" className="text-primary font-bold">Surname</Label>
                        <Input id="surname" value={editFormData.surname || ''} onChange={(e) => setEditFormData({...editFormData, surname: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob" className="text-primary font-bold">Date of Birth</Label>
                        <Input id="dob" type="date" value={editFormData.dob || ''} onChange={(e) => setEditFormData({...editFormData, dob: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="age" className="text-primary font-bold">Age</Label>
                        <Input id="age" type="number" value={editFormData.age || ''} onChange={(e) => setEditFormData({...editFormData, age: parseInt(e.target.value)})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sex" className="text-primary font-bold">Sex</Label>
                        <Select value={editFormData.sex || ''} onValueChange={(value) => setEditFormData({...editFormData, sex: value as any})}>
                            <SelectTrigger id="sex"><SelectValue placeholder="Select sex" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email" className="text-primary font-bold">Email</Label>
                        <Input id="email" type="email" value={editFormData.email || ''} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-primary font-bold">Phone</Label>
                        <Input id="phone" type="tel" value={editFormData.phone || ''} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="wellness_date" className="text-primary font-bold">Wellness Date</Label>
                        <Input id="wellness_date" type="date" value={editFormData.wellness_date || ''} onChange={(e) => setEditFormData({...editFormData, wellness_date: e.target.value})} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="corporate_id" className="text-primary font-bold">Corporate</Label>
                        <Select value={String(editFormData.corporate_id || 'null')} onValueChange={(value) => setEditFormData({...editFormData, corporate_id: value === 'null' ? null : parseInt(value)})}>
                            <SelectTrigger id="corporate_id"><SelectValue placeholder="Select corporate" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">None</SelectItem>
                                {corporates.map((corporate) => (
                                    <SelectItem key={corporate.id} value={String(corporate.id)}>{corporate.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="dark:text-foreground">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
