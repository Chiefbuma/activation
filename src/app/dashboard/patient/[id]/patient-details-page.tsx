'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Registration, User, Vital, Nutrition, Clinical, Corporate } from '@/lib/types';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ArrowLeft,
  HeartPulse,
  Scale,
  User as UserIcon,
  Cake,
  Phone,
  Mail,
  Building2,
  Binary,
  PlusCircle,
  FileText,
  Stethoscope,
  Trash2,
  Edit,
  Loader2,
  CalendarDays,
  BrainCircuit,
  CheckCircle2,
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
import { saveVital, saveNutrition, saveClinical, deleteAssessment, getRegistrationById, getCorporates, updateRegistration } from '@/lib/serve';
import { cn } from '@/lib/utils';

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
      <div className="bg-muted/50 rounded-full p-2 flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    )}
    <div className="grid gap-0.5 min-w-0">
      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider truncate">
        {label}
      </p>
      <p className="font-semibold text-sm text-foreground break-words">{value || '-'}</p>
    </div>
  </div>
);

const CLINICAL_OUTCOMES = [
    "All results within healthy range",
    "Healthy lifestyle changes recommended",
    "Comprehensive check recommended",
    "Medical Review recommended for raised blood pressure",
    "Medical Review recommended for raised blood sugar"
];

export default function PatientDetailsPage({ initialPatient }: { initialPatient: Registration }) {
  const { toast } = useToast();
  const router = useRouter();
  const [patient, setPatient] = useState<Registration>(initialPatient);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [corporates, setCorporates] = useState<Corporate[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isNutritionDialogOpen, setIsNutritionDialogOpen] = useState(false);
  const [isClinicalDialogOpen, setIsClinicalDialogOpen] = useState(false);

  const [vitalsForm, setVitalsForm] = useState<Partial<Vital>>({});
  const [nutritionForm, setNutritionForm] = useState<Partial<Nutrition>>({});
  const [clinicalForm, setClinicalForm] = useState<Partial<Clinical>>({});
  const [editForm, setEditForm] = useState<Partial<Registration>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    getCorporates().then(setCorporates).catch(console.error);
  }, []);

  const refreshData = async () => {
      try {
          const updated = await getRegistrationById(String(patient.id));
          setPatient(updated);
      } catch (err) {
          console.error("Refresh Error:", err);
      }
  };

  const handleOpenEdit = () => {
      setEditForm({
          ...patient,
          dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
          wellness_date: patient.wellness_date ? new Date(patient.wellness_date).toISOString().split('T')[0] : '',
      });
      setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
      setIsSubmitting(true);
      try {
          await updateRegistration(editForm);
          toast({ title: 'Success', description: 'Patient details updated.' });
          setIsEditModalOpen(false);
          refreshData();
      } catch (err: any) {
          toast({ variant: 'destructive', title: 'Error', description: err.message });
      }
      setIsSubmitting(false);
  };

  const handleSaveVitals = async () => {
    setIsSubmitting(true);
    try {
        await saveVital({
            ...vitalsForm,
            registration_id: patient.id,
            user_id: currentUser?.id,
            measured_at: vitalsForm.measured_at || new Date().toISOString()
        });
        toast({ title: 'Success', description: `Vitals record ${vitalsForm.id ? 'updated' : 'saved'}.` });
        setIsVitalsDialogOpen(false);
        setVitalsForm({});
        refreshData();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
    setIsSubmitting(false);
  };

  const handleDeleteVital = async (id: number) => {
    try {
        await deleteAssessment('vitals', id);
        toast({ title: 'Deleted', description: 'Vitals record removed.' });
        refreshData();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
  };

  const nutritionResults = useMemo(() => {
    const h = Number(nutritionForm.height) || 0;
    const w = Number(nutritionForm.weight) || 0;
    const vf = Number(nutritionForm.visceral_fat) || 0;
    const bf = Number(nutritionForm.body_fat_percent) || 0;

    if (!h || !w) return { bmi: 0, llw: 0, ulw: 0, excess_weight: 0, weight_loss_period: 'N/A', meal_plan: 'Not Recommended' as const };

    const hM = h / 100;
    const bmi = w / (hM * hM);
    const llw = 18.5 * (hM * hM);
    const ulw = 25 * (hM * hM);
    const excess = Math.max(0, w - ulw);
    const period = excess > 0 ? `${(excess / 12).toFixed(1)} Years` : '0 Years';

    const isMale = patient.sex === 'Male';
    let needsPlan = bmi > 25 || bmi < 18.5 || vf >= 12;
    if (bf) {
        if (isMale && (bf < 18 || bf > 24)) needsPlan = true;
        if (!isMale && (bf < 24 || bf > 31)) needsPlan = true;
    }

    return {
        bmi: parseFloat(bmi.toFixed(2)),
        llw: parseFloat(llw.toFixed(2)),
        ulw: parseFloat(ulw.toFixed(2)),
        excess_weight: parseFloat(excess.toFixed(2)),
        weight_loss_period: period,
        meal_plan: (needsPlan ? 'Recommended' : 'Not Recommended') as 'Recommended' | 'Not Recommended'
    };
  }, [nutritionForm.height, nutritionForm.weight, nutritionForm.visceral_fat, nutritionForm.body_fat_percent, patient.sex]);

  const handleSaveNutrition = async () => {
    setIsSubmitting(true);
    try {
        await saveNutrition({
            ...nutritionForm,
            ...nutritionResults,
            registration_id: patient.id,
            user_id: currentUser?.id
        });
        toast({ title: 'Success', description: `Nutrition record ${nutritionForm.id ? 'updated' : 'saved'}.` });
        setIsNutritionDialogOpen(false);
        setNutritionForm({});
        refreshData();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
    setIsSubmitting(false);
  };

  const toggleConclusion = (outcome: string) => {
      const current = clinicalForm.conclusion ? clinicalForm.conclusion.split(',').filter(Boolean) : [];
      let next;
      if (current.includes(outcome)) {
          next = current.filter(o => o !== outcome);
      } else {
          next = [...current, outcome];
      }
      setClinicalForm({ ...clinicalForm, conclusion: next.join(',') as any });
  };

  const handleSaveClinical = async () => {
    setIsSubmitting(true);
    try {
        await saveClinical({
            ...clinicalForm,
            registration_id: patient.id,
            user_id: currentUser?.id
        });
        toast({ title: 'Success', description: `Review ${clinicalForm.id ? 'updated' : 'recorded'}.` });
        setIsClinicalDialogOpen(false);
        setClinicalForm({});
        refreshData();
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
    setIsSubmitting(false);
  };

  const fallback = `${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`;

  return (
    <div className="container mx-auto max-w-7xl py-4 px-2 md:py-6 md:px-4">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="dark:text-foreground">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight text-primary">
                {`${patient.first_name} ${patient.surname || ''}`}
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">Activation Details</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs md:text-sm px-4 py-1 border-primary/30 text-primary bg-primary/5">
            Active Participant
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-primary/10">
              <CardHeader className="flex flex-col items-center text-center gap-4">
                <Avatar className="w-20 h-20 md:w-24 md:h-24 border-4 border-background shadow-lg rounded-full">
                  <AvatarFallback className="text-2xl md:text-3xl bg-primary text-primary-foreground font-bold">{fallback}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <CardTitle className="text-xl md:text-2xl">{`${patient.first_name} ${patient.surname || ''}`}</CardTitle>
                  <CardDescription>ID: {patient.id}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                 <Separator className="dark:bg-primary/10" />
                <div className="grid grid-cols-1 gap-4 pt-4">
                  <DetailItem icon={UserIcon} label="Full Name" value={`${patient.first_name} ${patient.middle_name || ''} ${patient.surname || ''}`} />
                  <DetailItem icon={Cake} label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'} />
                  <DetailItem icon={CalendarDays} label="Wellness Date" value={patient.wellness_date ? new Date(patient.wellness_date).toLocaleDateString() : 'N/A'} />
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
                <Button variant="outline" onClick={handleOpenEdit} className="justify-start"><Edit className="mr-2 h-4 w-4" /> Edit Patient Details</Button>
                <Button onClick={() => setIsReportModalOpen(true)} className="justify-start"><FileText className="mr-2 h-4 w-4" /> Generate Report</Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-primary/10 overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <HeartPulse className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Vital Signs</CardTitle>
                        <CardDescription>Physiological history (tracking all records)</CardDescription>
                    </div>
                </div>
                <Button size="sm" onClick={() => { setVitalsForm({}); setIsVitalsDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4"/>Record Vitals
                </Button>
                <Dialog open={isVitalsDialogOpen} onOpenChange={setIsVitalsDialogOpen}>
                    <DialogContent className="max-w-md border-primary/20 w-[95vw] sm:w-full">
                        <DialogHeader><DialogTitle className="text-primary">{vitalsForm.id ? 'Edit' : 'New'} Vital Signs</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">Systolic (mmHg)</Label><Input type="number" value={vitalsForm.bp_systolic || ''} onChange={e => setVitalsForm({...vitalsForm, bp_systolic: e.target.value})} /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">Diastolic (mmHg)</Label><Input type="number" value={vitalsForm.bp_diastolic || ''} onChange={e => setVitalsForm({...vitalsForm, bp_diastolic: e.target.value})} /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">Pulse (bpm)</Label><Input type="number" value={vitalsForm.pulse || ''} onChange={e => setVitalsForm({...vitalsForm, pulse: e.target.value})} /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">Temp (°C)</Label><Input type="number" step="0.1" value={vitalsForm.temp || ''} onChange={e => setVitalsForm({...vitalsForm, temp: e.target.value})} /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">RBS (mmol/L)</Label><Input value={vitalsForm.rbs || ''} onChange={e => setVitalsForm({...vitalsForm, rbs: e.target.value})} /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">FBS (mmol/L)</Label><Input value={vitalsForm.fbs || ''} onChange={e => setVitalsForm({...vitalsForm, fbs: e.target.value})} /></div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsVitalsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveVitals} disabled={isSubmitting} className="w-full sm:w-auto">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {vitalsForm.id ? 'Update Record' : 'Save Record'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.vitals.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-primary/10">
                        <table className="min-w-full text-xs">
                            <thead className="bg-muted/50">
                                <tr className="border-b border-primary/10">
                                    <th className="text-left py-3 px-4 font-bold text-primary uppercase">Date</th>
                                    <th className="text-left py-3 px-4 font-bold text-primary uppercase">Value</th>
                                    <th className="text-right py-3 px-4 font-bold text-primary uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patient.vitals.map((v) => (
                                    <tr key={v.id} className="hover:bg-muted/30 border-b border-primary/5">
                                        <td className="py-3 px-4">{new Date(v.measured_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 font-medium">{v.bp_systolic}/{v.bp_diastolic} BP, {v.pulse} Pulse, {v.temp}°C</td>
                                        <td className="py-3 px-4 text-right flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => { setVitalsForm(v); setIsVitalsDialogOpen(true); }} className="hover:bg-primary/10 h-7 w-7 text-primary"><Edit className="h-3 w-3"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-7 w-7" onClick={() => handleDeleteVital(v.id)}><Trash2 className="h-3 w-3"/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-center text-muted-foreground py-4 text-sm">No vitals recorded.</p>}
              </CardContent>
            </Card>

            <Card className="border-primary/10 overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Nutrition Assessment</CardTitle>
                        <CardDescription>Body composition (One record allowed)</CardDescription>
                    </div>
                </div>
                <Button size="sm" disabled={patient.nutritions.length > 0} onClick={() => { setNutritionForm({}); setIsNutritionDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4"/>Record Nutrition
                </Button>
                <Dialog open={isNutritionDialogOpen} onOpenChange={setIsNutritionDialogOpen}>
                    <DialogContent className="max-w-lg border-primary/20 w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle className="text-primary">{nutritionForm.id ? 'Edit' : 'New'} Nutrition Record</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">Height (cm)</Label><Input type="number" value={nutritionForm.height || ''} onChange={e => setNutritionForm({...nutritionForm, height: e.target.value})} /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">Weight (kg)</Label><Input type="number" step="0.1" value={nutritionForm.weight || ''} onChange={e => setNutritionForm({...nutritionForm, weight: e.target.value})} /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">Visceral Fat</Label><Input type="number" value={nutritionForm.visceral_fat || ''} onChange={e => setNutritionForm({...nutritionForm, visceral_fat: e.target.value})} /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold text-xs">Body Fat %</Label><Input type="number" step="0.1" value={nutritionForm.body_fat_percent || ''} onChange={e => setNutritionForm({...nutritionForm, body_fat_percent: e.target.value})} /></div>
                        </div>
                        {nutritionForm.height && nutritionForm.weight && (
                            <div className="bg-muted/50 p-4 rounded-xl space-y-3 text-xs border border-primary/10">
                                <p className="font-bold text-primary uppercase">Calculation Insights</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <p>Low Weight (BMI 18.5): <span className="font-bold">{nutritionResults.llw}kg</span></p>
                                    <p>High Weight (BMI 25): <span className="font-bold">{nutritionResults.ulw}kg</span></p>
                                    <p>Excess: <span className="font-bold">{nutritionResults.excess_weight}kg</span></p>
                                    <p>Period: <span className="font-bold">{nutritionResults.weight_loss_period}</span></p>
                                    <p>BMI: <span className="font-bold">{nutritionResults.bmi}</span></p>
                                    <p>Plan: <span className={cn("font-bold", nutritionResults.meal_plan === 'Recommended' ? "text-primary" : "text-slate-500")}>{nutritionResults.meal_plan}</span></p>
                                </div>
                            </div>
                        )}
                        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsNutritionDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveNutrition} disabled={isSubmitting} className="w-full sm:w-auto">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {nutritionForm.id ? 'Update Record' : 'Save Record'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.nutritions.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-primary/10">
                        <table className="min-w-full text-xs">
                            <thead className="bg-muted/50">
                                <tr className="border-b border-primary/10">
                                    <th className="text-left py-3 px-4 font-bold text-primary uppercase">Date</th>
                                    <th className="text-left py-3 px-4 font-bold text-primary uppercase">Value</th>
                                    <th className="text-left py-3 px-4 font-bold text-primary uppercase">BMI</th>
                                    <th className="text-right py-3 px-4 font-bold text-primary uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patient.nutritions.map((n) => (
                                    <tr key={n.id} className="hover:bg-muted/30 border-b border-primary/5">
                                        <td className="py-3 px-4">{new Date(n.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 font-medium">{n.weight}kg, {n.height}cm</td>
                                        <td className="py-3 px-4 font-medium">{n.bmi}</td>
                                        <td className="py-3 px-4 text-right flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => { setNutritionForm(n); setIsNutritionDialogOpen(true); }} className="hover:bg-primary/10 h-7 w-7 text-primary"><Edit className="h-3 w-3"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => deleteAssessment('nutritions', n.id).then(refreshData)}><Trash2 className="h-3 w-3"/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-center text-muted-foreground py-4 text-sm">No nutrition data recorded.</p>}
              </CardContent>
            </Card>

            <Card className="border-primary/10 overflow-hidden">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <BrainCircuit className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Psychosocial Assessment</CardTitle>
                        <CardDescription>Stress and emotional wellbeing</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent>
                {patient.clinicals.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-primary/10">
                        <table className="min-w-full text-xs">
                            <thead className="bg-muted/50">
                                <tr className="border-b border-primary/10">
                                    <th className="text-left py-3 px-4 font-bold text-primary uppercase">Date</th>
                                    <th className="text-left py-3 px-4 font-bold text-primary uppercase">Stress Rating</th>
                                    <th className="text-left py-3 px-4 font-bold text-primary uppercase">Recommendation</th>
                                    <th className="text-right py-3 px-4 font-bold text-primary uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patient.clinicals.map((c) => (
                                    <tr key={c.id} className="hover:bg-muted/30 border-b border-primary/5">
                                        <td className="py-3 px-4">{new Date(c.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 font-medium">{c.verbal_stress_rating}/10</td>
                                        <td className="py-3 px-4 font-semibold">{c.counselling_sessions}</td>
                                        <td className="py-3 px-4 text-right flex justify-end gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => { setClinicalForm(c); setIsClinicalDialogOpen(true); }} className="hover:bg-primary/10 h-7 w-7 text-primary"><Edit className="h-3 w-3"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => deleteAssessment('clinicals', c.id).then(refreshData)}><Trash2 className="h-3 w-3"/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-center text-muted-foreground py-4 text-sm">No review recorded.</p>}
              </CardContent>
            </Card>

            <Card className="border-primary/10">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Clinical Assessment</CardTitle>
                        <CardDescription>Professional conclusions (One review allowed)</CardDescription>
                    </div>
                </div>
                <Button size="sm" disabled={patient.clinicals.length > 0} onClick={() => { setClinicalForm({}); setIsClinicalDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4"/>Conduct Review
                </Button>
                <Dialog open={isClinicalDialogOpen} onOpenChange={setIsClinicalDialogOpen}>
                    <DialogContent className="max-w-2xl border-primary/20 w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle className="text-primary">{clinicalForm.id ? 'Edit' : 'New'} Clinical Review</DialogTitle></DialogHeader>
                        <div className="flex flex-col gap-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-primary font-bold text-xs">Verbal Stress Rating (1-10)</Label>
                                    <Input type="number" min="1" max="10" value={clinicalForm.verbal_stress_rating || ''} onChange={e => setClinicalForm({...clinicalForm, verbal_stress_rating: Number(e.target.value)})} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-primary font-bold text-xs">Manual Counselling Referral</Label>
                                    <Select value={clinicalForm.counselling_sessions || undefined} onValueChange={(v) => setClinicalForm({...clinicalForm, counselling_sessions: v as any})}>
                                        <SelectTrigger><SelectValue placeholder="Select recommendation" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Recommended">Recommended</SelectItem>
                                            <SelectItem value="Not Recommended">Not Recommended</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-primary font-bold text-xs uppercase tracking-wider">Wellness Check Outcomes (Multi-Select)</Label>
                                <div className="grid grid-cols-1 gap-2 border rounded-xl p-3 bg-muted/20">
                                    {CLINICAL_OUTCOMES.map((outcome) => {
                                        const isSelected = clinicalForm.conclusion?.split(',').includes(outcome);
                                        return (
                                            <Button
                                                key={outcome}
                                                type="button"
                                                variant={isSelected ? "default" : "outline"}
                                                size="sm"
                                                className={cn(
                                                    "justify-start h-auto py-2 px-3 text-left font-normal text-xs whitespace-normal",
                                                    isSelected ? "bg-primary text-white" : "hover:bg-primary/5"
                                                )}
                                                onClick={() => toggleConclusion(outcome)}
                                            >
                                                {isSelected ? <CheckCircle2 className="mr-2 h-3 w-3 shrink-0" /> : <div className="mr-2 h-3 w-3 shrink-0 rounded-full border" />}
                                                {outcome}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-primary font-bold text-xs">Doctor's Notes</Label>
                                <Textarea value={clinicalForm.doctor_notes || ''} onChange={e => setClinicalForm({...clinicalForm, doctor_notes: e.target.value})} className="min-h-[120px]" placeholder="Add detailed observations here..." />
                            </div>
                        </div>
                        <DialogFooter className="flex-col sm:flex-row gap-2">
                            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsClinicalDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveClinical} disabled={isSubmitting} className="w-full sm:w-auto">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {clinicalForm.id ? 'Update Review' : 'Submit Review'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.clinicals.length > 0 ? (
                    <div className="space-y-4">
                        {patient.clinicals.map(c => (
                            <div key={c.id} className="p-4 border rounded-xl bg-muted/20 relative dark:border-primary/10">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />
                                <div className="grid grid-cols-1 gap-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <Label className="text-primary text-[9px] uppercase font-bold tracking-wider">Outcomes</Label>
                                            <p className="font-semibold text-sm text-foreground">{c.conclusion?.split(',').join(', ') || 'N/A'}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" onClick={() => { setClinicalForm(c); setIsClinicalDialogOpen(true); }} className="hover:bg-primary/10 h-7 w-7 text-primary"><Edit className="h-3 w-3"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 h-7 w-7" onClick={() => deleteAssessment('clinicals', c.id).then(refreshData)}><Trash2 className="h-3 w-3"/></Button>
                                        </div>
                                    </div>
                                    {c.doctor_notes && (
                                        <div>
                                            <Label className="text-primary text-[9px] uppercase font-bold tracking-wider">Notes</Label>
                                            <p className="text-xs text-muted-foreground line-clamp-3">{c.doctor_notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-muted-foreground py-4 text-sm">No clinical conclusions found.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                  <DialogTitle className="text-primary">Edit Patient Details</DialogTitle>
                  <DialogDescription>Update demographic and administrative information.</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2"><Label className="font-bold text-xs">First Name</Label><Input value={editForm.first_name || ''} onChange={e => setEditForm({...editForm, first_name: e.target.value})} /></div>
                  <div className="space-y-2"><Label className="font-bold text-xs">Middle Name</Label><Input value={editForm.middle_name || ''} onChange={e => setEditForm({...editForm, middle_name: e.target.value})} /></div>
                  <div className="space-y-2"><Label className="font-bold text-xs">Surname</Label><Input value={editForm.surname || ''} onChange={e => setEditForm({...editForm, surname: e.target.value})} /></div>
                  <div className="space-y-2">
                      <Label className="font-bold text-xs">Sex</Label>
                      <Select value={editForm.sex || ''} onValueChange={v => setEditForm({...editForm, sex: v as any})}>
                          <SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2"><Label className="font-bold text-xs">Age</Label><Input type="number" value={editForm.age || ''} onChange={e => setEditForm({...editForm, age: Number(e.target.value)})} /></div>
                  <div className="space-y-2"><Label className="font-bold text-xs">Date of Birth</Label><Input type="date" value={editForm.dob || ''} onChange={e => setEditForm({...editForm, dob: e.target.value})} /></div>
                  <div className="space-y-2"><Label className="font-bold text-xs">Phone</Label><Input type="tel" value={editForm.phone || ''} onChange={e => setEditForm({...editForm, phone: e.target.value})} /></div>
                  <div className="space-y-2"><Label className="font-bold text-xs">Email</Label><Input type="email" value={editForm.email || ''} onChange={e => setEditForm({...editForm, email: e.target.value})} /></div>
                  <div className="space-y-2">
                      <Label className="font-bold text-xs">Corporate</Label>
                      <Select value={String(editForm.corporate_id || 'null')} onValueChange={v => setEditForm({...editForm, corporate_id: v === 'null' ? null : Number(v)})}>
                          <SelectTrigger><SelectValue placeholder="Select corporate" /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="null">None</SelectItem>
                              {corporates.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2"><Label className="font-bold text-xs">Wellness Date</Label><Input type="date" value={editForm.wellness_date || ''} onChange={e => setEditForm({...editForm, wellness_date: e.target.value})} /></div>
              </div>
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

       {isReportModalOpen && (
        <ReportViewer
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          patient={patient}
          corporate={patient.corporate_id ? { id: patient.corporate_id, name: patient.corporate_name!, wellness_date: patient.wellness_date! } : null}
        />
      )}
    </div>
  );
}
