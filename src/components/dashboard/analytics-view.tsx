'use client';

import { useMemo } from 'react';
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
  TableRow,
} from "@/components/ui/table";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Calculator } from 'lucide-react';

interface AnalyticsViewProps {
  patients: Registration[];
  corporates: Corporate[];
}

export default function AnalyticsView({ patients, corporates }: AnalyticsViewProps) {
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
    </div>
  );
}
