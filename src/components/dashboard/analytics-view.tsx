'use client';

import { useMemo, useState } from 'react';
import type { Registration, Corporate } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Calculator, CalendarRange } from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachWeekOfInterval, 
  isSameMonth, 
  isWithinInterval,
  subMonths,
  endOfWeek
} from 'date-fns';

interface AnalyticsViewProps {
  patients: Registration[];
  corporates: Corporate[];
}

export default function AnalyticsView({ patients, corporates }: AnalyticsViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  // SAFE regex split helper to replace .split()
  const safeSplitDate = (dateStr: string | undefined | null): string[] => {
    if (!dateStr) return [];
    try {
      // Use regex to match all sequences of non-hyphen characters
      return String(dateStr).match(/[^-]+/g) || [];
    } catch (error) {
      console.error('Error splitting date:', error);
      return [];
    }
  };

  const monthOptions = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), i);
      return {
        label: format(date, 'MMMM yyyy'),
        value: format(date, 'yyyy-MM'),
      };
    });
  }, []);

  const summary = useMemo(() => {
    const totalReg = patients.length;
    const totalActive = patients.filter(p => 
        (p.vitals?.length || 0) > 0 || 
        (p.nutritions?.length || 0) > 0 || 
        (p.clinicals?.length || 0) > 0
    ).length;
    const maleCount = patients.filter(p => p.sex === 'Male').length;
    const femaleCount = patients.filter(p => p.sex === 'Female').length;
    const totalCorps = corporates.length;

    const recommendedMealPlan = patients.filter(p => 
        p.nutritions?.some(n => n.meal_plan === 'Recommended')
    ).length;
    
    const recommendedCounselling = patients.filter(p => 
        p.clinicals?.some(c => c.counselling_sessions === 'Recommended')
    ).length;

    return { totalReg, totalActive, totalCorps, maleCount, femaleCount, recommendedMealPlan, recommendedCounselling };
  }, [patients, corporates]);

  const weeklyTrackerData = useMemo(() => {
    try {
      let monthValue = selectedMonth;
      if (!monthValue) {
        monthValue = format(new Date(), 'yyyy-MM');
      }
      
      // Using regex splitting method
      const parts = safeSplitDate(monthValue);
      if (parts.length !== 2) return [];
      
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      
      if (isNaN(year) || isNaN(month)) return [];

      const targetDate = new Date(year, month - 1, 1);
      const monthStart = startOfMonth(targetDate);
      const monthEnd = endOfMonth(targetDate);

      const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });
      
      return weeks.slice(0, 5).map((weekStart, idx) => {
        const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
        const effectiveEnd = weekEnd > monthEnd ? monthEnd : weekEnd;

        const interval = { start: weekStart, end: effectiveEnd };
        const weekPatients = patients.filter(p => {
          const created = new Date(p.created_at);
          return isWithinInterval(created, interval) && isSameMonth(created, monthStart);
        });

        const uniqueCorps = new Set(weekPatients.filter(p => p.corporate_id).map(p => p.corporate_id)).size;
        const male = weekPatients.filter(p => p.sex === 'Male').length;
        const female = weekPatients.filter(p => p.sex === 'Female').length;

        const recommendedMealPlans = weekPatients.filter(p => 
          p.nutritions?.some(n => n.meal_plan === 'Recommended')
        ).length;
        
        const recommendedCounselling = weekPatients.filter(p => 
          p.clinicals?.some(c => c.counselling_sessions === 'Recommended')
        ).length;

        return {
          weekLabel: `Week ${idx + 1}`,
          registrations: weekPatients.length,
          male,
          female,
          corporates: uniqueCorps,
          recommendedMealPlans,
          recommendedCounselling
        };
      });
    } catch (error) {
      console.error('Error in weeklyTrackerData:', error);
      return [];
    }
  }, [patients, selectedMonth]);

  const genderChartData = [
    { name: 'Male', value: summary.maleCount, color: 'hsl(var(--primary))' },
    { name: 'Female', value: summary.femaleCount, color: 'hsl(var(--chart-3))' },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-primary/10 flex flex-col h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Activation Summary
            </CardTitle>
            <CardDescription>Program performance at a glance</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-6">
            <div className="rounded-xl border border-primary/5 overflow-hidden bg-muted/30">
              <Table className="border-0">
                <TableBody>
                  <TableRow className="hover:bg-transparent border-b border-primary/10">
                    <TableCell className="font-medium text-muted-foreground">Total Registrations</TableCell>
                    <TableCell className="text-right font-bold text-lg">{summary.totalReg}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent border-b border-primary/10">
                    <TableCell className="font-medium text-muted-foreground">Total Activations</TableCell>
                    <TableCell className="text-right font-bold text-lg text-primary">{summary.totalActive}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent border-b border-primary/10">
                    <TableCell className="font-medium text-muted-foreground">Active Corporates</TableCell>
                    <TableCell className="text-right font-bold text-lg">{summary.totalCorps}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent border-b border-primary/10">
                    <TableCell className="font-medium text-muted-foreground">Male Participants</TableCell>
                    <TableCell className="text-right font-bold text-lg">{summary.maleCount}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent border-b border-primary/10">
                    <TableCell className="font-medium text-muted-foreground">Female Participants</TableCell>
                    <TableCell className="text-right font-bold text-lg">{summary.femaleCount}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent border-b border-primary/10">
                    <TableCell className="font-medium text-muted-foreground">Recommended Meal Plans</TableCell>
                    <TableCell className="text-right font-bold text-lg text-teal-600">{summary.recommendedMealPlan}</TableCell>
                  </TableRow>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableCell className="font-medium text-muted-foreground">Recommended Counselling</TableCell>
                    <TableCell className="text-right font-bold text-lg text-teal-600">{summary.recommendedCounselling}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 h-full flex flex-col items-center justify-center p-8">
            <CardHeader className="w-full text-center">
                <CardTitle className="text-lg font-bold">Gender Distribution</CardTitle>
                <CardDescription>Participation split by sex</CardDescription>
            </CardHeader>
            <div className="h-[250px] w-full flex flex-col items-center justify-center">
                <ChartContainer config={{}} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={genderChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {genderChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<ChartTooltipContent hideLabel />} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
                <div className="flex gap-6 text-sm mt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-muted-foreground font-medium">Male ({summary.maleCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-3))]" />
                        <span className="text-muted-foreground font-medium">Female ({summary.femaleCount})</span>
                    </div>
                </div>
            </div>
        </Card>
      </div>

      {weeklyTrackerData.length > 0 && (
        <Card className="border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarRange className="h-5 w-5 text-primary" />
                Monthly Weekly Tracker
              </CardTitle>
              <CardDescription>Metrics breakdown by week</CardDescription>
            </div>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px] bg-background border-primary/20">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-primary/10 overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold text-primary w-[150px]">Metric</TableHead>
                    {weeklyTrackerData.map(w => (
                      <TableHead key={w.weekLabel} className="text-center font-bold text-primary">
                        {w.weekLabel}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="hover:bg-primary/5">
                    <TableCell className="font-semibold">Active Corporates</TableCell>
                    {weeklyTrackerData.map(w => (
                      <TableCell key={w.weekLabel} className="text-center font-bold">{w.corporates}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="hover:bg-primary/5">
                    <TableCell className="font-semibold">Total Registrations</TableCell>
                    {weeklyTrackerData.map(w => (
                      <TableCell key={w.weekLabel} className="text-center font-bold text-lg">{w.registrations}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="hover:bg-primary/5">
                    <TableCell className="font-semibold pl-8">— Male</TableCell>
                    {weeklyTrackerData.map(w => (
                      <TableCell key={w.weekLabel} className="text-center">{w.male}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="hover:bg-primary/5">
                    <TableCell className="font-semibold pl-8">— Female</TableCell>
                    {weeklyTrackerData.map(w => (
                      <TableCell key={w.weekLabel} className="text-center">{w.female}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="hover:bg-primary/5">
                    <TableCell className="font-semibold">Recommended Meal Plans</TableCell>
                    {weeklyTrackerData.map(w => (
                      <TableCell key={w.weekLabel} className="text-center font-bold text-teal-600">{w.recommendedMealPlans}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow className="hover:bg-primary/5">
                    <TableCell className="font-semibold">Recommended Counselling</TableCell>
                    {weeklyTrackerData.map(w => (
                      <TableCell key={w.weekLabel} className="text-center font-bold text-teal-600">{w.recommendedCounselling}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 italic">
              * Tracker shows registrations and unique active corporate partners for the selected month.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
