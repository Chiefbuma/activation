
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Registration, User, Vital, Nutrition, Clinical } from '@/lib/types';
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
import { saveVital, saveNutrition, saveClinical, deleteAssessment } from '@/lib/actions';

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
  const router = useRouter();
  const [patient, setPatient] = useState<Registration>(initialPatient);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Modal States
  const [isVitalsDialogOpen, setIsVitalsDialogOpen] = useState(false);
  const [isNutritionDialogOpen, setIsNutritionDialogOpen] = useState(false);
  const [isClinicalDialogOpen, setIsClinicalDialogOpen] = useState(false);

  // Form States
  const [vitalsForm, setVitalsForm] = useState<Partial<Vital>>({});
  const [nutritionForm, setNutritionForm] = useState<Partial<Nutrition>>({});
  const [clinicalForm, setClinicalForm] = useState<Partial<Clinical>>({});
  const [editFormData, setEditFormData] = useState<Partial<Registration>>({});

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const fallback = `${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`;

  const handleSaveVitals = async () => {
    setIsSubmitting(true);
    const result = await saveVital({
        ...vitalsForm,
        registration_id: patient.id,
        user_id: currentUser?.id,
        measured_at: vitalsForm.measured_at || new Date().toISOString()
    });

    if (result.success) {
        toast({ title: 'Success', description: 'Vitals record saved.' });
        setIsVitalsDialogOpen(false);
        router.refresh();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };

  const handleDeleteVital = async (id: number) => {
    const result = await deleteAssessment('vitals', id, patient.id);
    if (result.success) {
        toast({ title: 'Deleted', description: 'Vitals record removed.' });
        router.refresh();
    }
  };

  const calculateNutritionResults = (form: Partial<Nutrition>) => {
    const height = Number(form.height);
    const weight = Number(form.weight);
    const visceral = Number(form.visceral_fat);
    const bodyFat = Number(form.body_fat_percent);

    if (!height || !weight) return { meal_plan: 'Not Recommended', weight_loss_period: 'N/A', llw: null, ulw: null, excess_weight: null, bmi: null };

    const hM = height / 100;
    const bmi = weight / (hM * hM);
    const llw = 18 * (hM * hM);
    const ulw = 25 * (hM * hM);
    
    const bfMax = patient.sex === 'Male' ? 24 : 31;
    const bfMin = patient.sex === 'Male' ? 18 : 24;

    const needsPlan = bmi > 25 || bmi < 18.5 || visceral >= 12 || bodyFat > bfMax || bodyFat < bfMin;
    const excess = Math.max(0, weight - ulw);
    const weight_loss_period = excess > 0 ? `${(excess / 12).toFixed(1)} Years` : '0 Years';

    return {
        bmi: parseFloat(bmi.toFixed(1)),
        meal_plan: (needsPlan ? 'Recommended' : 'Not Recommended') as 'Recommended' | 'Not Recommended',
        llw: parseFloat(llw.toFixed(1)),
        ulw: parseFloat(ulw.toFixed(1)),
        excess_weight: parseFloat(excess.toFixed(1)),
        weight_loss_period
    };
  };

  const handleSaveNutrition = async () => {
    setIsSubmitting(true);
    const results = calculateNutritionResults(nutritionForm);
    const result = await saveNutrition({
        ...nutritionForm,
        ...results,
        registration_id: patient.id,
        user_id: currentUser?.id
    });

    if (result.success) {
        toast({ title: 'Success', description: 'Nutrition record saved.' });
        setIsNutritionDialogOpen(false);
        router.refresh();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };

  const handleSaveClinical = async () => {
    setIsSubmitting(true);
    const stressRating = Number(clinicalForm.verbal_stress_rating);
    const counselling = stressRating > 7 ? 'Recommended' : 'Not Recommended';

    const result = await saveClinical({
        ...clinicalForm,
        counselling_sessions: counselling,
        registration_id: patient.id,
        user_id: currentUser?.id
    });

    if (result.success) {
        toast({ title: 'Success', description: 'Clinical review recorded.' });
        setIsClinicalDialogOpen(false);
        router.refresh();
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsSubmitting(false);
  };

  const nutritionResults = calculateNutritionResults(nutritionForm);

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4">
      {/* Existing UI layout remains same, just functions connected to real actions */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="dark:text-foreground">
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
                <Button variant="outline" className="justify-start dark:text-foreground" onClick={() => setIsEditModalOpen(true)}><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
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
                <Dialog open={isVitalsDialogOpen} onOpenChange={setIsVitalsDialogOpen}>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Record Vitals</Button></DialogTrigger>
                    <DialogContent className="max-w-md border-primary/20">
                        <DialogHeader><DialogTitle className="text-primary">{vitalsForm.id ? 'Edit' : 'New'} Vital Signs</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2"><Label className="text-primary font-bold">Systolic (mmHg)</Label><Input type="number" value={vitalsForm.bp_systolic || ''} onChange={e => setVitalsForm({...vitalsForm, bp_systolic: parseInt(e.target.value)})} className="dark:border-primary/40" /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Diastolic (mmHg)</Label><Input type="number" value={vitalsForm.bp_diastolic || ''} onChange={e => setVitalsForm({...vitalsForm, bp_diastolic: parseInt(e.target.value)})} className="dark:border-primary/40" /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Pulse (bpm)</Label><Input type="number" value={vitalsForm.pulse || ''} onChange={e => setVitalsForm({...vitalsForm, pulse: parseInt(e.target.value)})} className="dark:border-primary/40" /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Temp (°C)</Label><Input type="number" step="0.1" value={vitalsForm.temp || ''} onChange={e => setVitalsForm({...vitalsForm, temp: parseFloat(e.target.value)})} className="dark:border-primary/40" /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">RBS (mmol/L)</Label><Input value={vitalsForm.rbs || ''} onChange={e => setVitalsForm({...vitalsForm, rbs: e.target.value})} className="dark:border-primary/40" /></div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold">FBS (mmol/L)</Label>
                                <Input value={vitalsForm.fbs || ''} onChange={e => setVitalsForm({...vitalsForm, fbs: e.target.value})} className="dark:border-primary/40" />
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
                    <div className="overflow-x-auto rounded-xl border border-primary/10">
                        <table className="min-w-full text-xs">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium border-b">Date</th>
                                    <th className="text-left py-3 px-4 font-medium border-b">Value</th>
                                    <th className="text-right py-3 px-4 font-medium border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patient.vitals.map((v) => (
                                    <tr key={v.id} className="hover:bg-muted/30 border-b border-primary/5">
                                        <td className="py-3 px-4">{new Date(v.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">{v.bp_systolic}/{v.bp_diastolic} BP, {v.pulse} Pulse</td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => { setVitalsForm(v); setIsVitalsDialogOpen(true); }}><Edit className="h-4 w-4"/></Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteVital(v.id)}><Trash2 className="h-4 w-4"/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                <Dialog open={isNutritionDialogOpen} onOpenChange={setIsNutritionDialogOpen}>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Record Nutrition</Button></DialogTrigger>
                    <DialogContent className="max-w-md border-primary/20">
                        <DialogHeader><DialogTitle className="text-primary">Nutrition Record</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2"><Label className="text-primary font-bold">Height (cm)</Label><Input type="number" value={nutritionForm.height || ''} onChange={e => setNutritionForm({...nutritionForm, height: parseInt(e.target.value)})} className="dark:border-primary/40" /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Weight (kg)</Label><Input type="number" step="0.1" value={nutritionForm.weight || ''} onChange={e => setNutritionForm({...nutritionForm, weight: parseFloat(e.target.value)})} className="dark:border-primary/40" /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Visceral Fat</Label><Input type="number" value={nutritionForm.visceral_fat || ''} onChange={e => setNutritionForm({...nutritionForm, visceral_fat: parseInt(e.target.value)})} className="dark:border-primary/40" /></div>
                            <div className="space-y-2"><Label className="text-primary font-bold">Body Fat %</Label><Input type="number" step="0.1" value={nutritionForm.body_fat_percent || ''} onChange={e => setNutritionForm({...nutritionForm, body_fat_percent: parseFloat(e.target.value)})} className="dark:border-primary/40" /></div>
                        </div>
                        <DialogFooter>
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
                    <div className="overflow-x-auto rounded-xl border border-primary/10">
                        <table className="min-w-full text-xs">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left py-3 px-4 font-medium border-b">Date</th>
                                    <th className="text-left py-3 px-4 font-medium border-b">Value</th>
                                    <th className="text-left py-3 px-4 font-medium border-b">BMI</th>
                                    <th className="text-left py-3 px-4 font-medium border-b">Meal Plan</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patient.nutritions.map((n) => (
                                    <tr key={n.id} className="border-b border-primary/5">
                                        <td className="py-3 px-4">{new Date(n.created_at).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">{n.weight}kg, {n.height}cm</td>
                                        <td className="py-3 px-4">{n.bmi}</td>
                                        <td className="py-3 px-4 font-bold">{n.meal_plan}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">No nutrition data recorded.</p>}
              </CardContent>
            </Card>

            {/* Clinical */}
            <Card className="border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <Stethoscope className="w-6 h-6 text-primary" />
                    <div>
                        <CardTitle>Clinical Review</CardTitle>
                        <CardDescription>Medical observations</CardDescription>
                    </div>
                </div>
                <Dialog open={isClinicalDialogOpen} onOpenChange={setIsClinicalDialogOpen}>
                    <DialogTrigger asChild><Button size="sm"><PlusCircle className="mr-2 h-4 w-4"/>Conduct Review</Button></DialogTrigger>
                    <DialogContent className="max-w-lg border-primary/20">
                        <DialogHeader><DialogTitle className="text-primary">Clinical Review</DialogTitle></DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-primary font-bold">Verbal Stress Rating (1-10)</Label>
                                <Input type="number" min="1" max="10" value={clinicalForm.verbal_stress_rating || ''} onChange={e => setClinicalForm({...clinicalForm, verbal_stress_rating: parseInt(e.target.value)})} className="dark:border-primary/40" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold">Conclusion</Label>
                                <Select onValueChange={(v) => setClinicalForm({...clinicalForm, conclusion: v})}>
                                    <SelectTrigger className="dark:border-primary/40"><SelectValue placeholder="Select outcome" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All results within healthy range">All results within healthy range</SelectItem>
                                        <SelectItem value="Healthy lifestyle changes recommended">Healthy lifestyle changes recommended</SelectItem>
                                        <SelectItem value="Medical Review recommended for raised blood pressure">Medical Review recommended for raised blood pressure</SelectItem>
                                        <SelectItem value="Medical Review recommended for raised blood sugar">Medical Review recommended for raised blood sugar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-primary font-bold">Doctor's Notes</Label>
                                <Textarea value={clinicalForm.doctor_notes || ''} onChange={e => setClinicalForm({...clinicalForm, doctor_notes: e.target.value})} className="dark:border-primary/40" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSaveClinical} disabled={isSubmitting}>Submit Review</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.clinicals.length > 0 ? (
                    <div className="space-y-4">
                        {patient.clinicals.map(c => (
                            <div key={c.id} className="p-4 border rounded-xl bg-muted/20 relative">
                                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-primary uppercase">Conclusion</p>
                                    <p className="text-sm font-semibold">{c.conclusion}</p>
                                    <Separator />
                                    <p className="text-xs font-bold text-primary uppercase">Notes</p>
                                    <p className="text-sm">{c.doctor_notes}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <p className="text-center text-muted-foreground py-4">No reviews found.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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
