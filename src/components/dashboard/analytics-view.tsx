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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, subWeeks, eachWeekOfInterval } from 'date-fns';
import { Building2, CalendarDays, Users2 } from 'lucide-react';

interface AnalyticsViewProps {
  patients: Registration[];
  corporates: Corporate[];
}

export default function AnalyticsView({ patients, corporates }: AnalyticsViewProps) {
  // 1. Patients per Corporate
  const corporateData = useMemo(() => {
    const counts: Record<string, number> = {};
    patients.forEach((p) => {
      const name = p.corporate_name || 'Individual';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [patients]);

  // 2. Weekly Activations
  const weeklyData = useMemo(() => {
    const now = new Date();
    const sixWeeksAgo = subWeeks(now, 6);
    const weeks = eachWeekOfInterval({ start: sixWeeksAgo, end: now });

    return weeks.map((weekStart) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const count = patients.filter((p) => {
        const date = new Date(p.created_at);
        return date >= weekStart && date < weekEnd;
      }).length;

      return {
        week: `${format(weekStart, 'MMM dd')} - ${format(new Date(weekEnd.getTime() - 1), 'MMM dd')}`,
        count,
      };
    }).reverse();
  }, [patients]);

  // 3. Gender Distribution
  const genderData = useMemo(() => {
    const counts: Record<string, number> = { Male: 0, Female: 0, Other: 0 };
    patients.forEach((p) => {
      if (p.sex) counts[p.sex]++;
    });
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }));
  }, [patients]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Corporate Table */}
      <Card className="lg:col-span-2 border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Corporate Activations
            </CardTitle>
            <CardDescription>Breakdown of participants by corporate partner</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
            {corporateData.length} Partners
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-primary/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold text-primary">Corporate Partner</TableHead>
                  <TableHead className="text-right font-bold text-primary">Activated Patients</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {corporateData.map((item) => (
                  <TableRow key={item.name} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center bg-primary text-primary-foreground font-bold rounded-full h-6 min-w-[24px] px-1.5 text-xs">
                            {item.count}
                        </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Gender Distribution Table */}
      <Card className="border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Users2 className="h-5 w-5 text-primary" />
            Gender Breakdown
          </CardTitle>
          <CardDescription>Participant demographic split</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-primary/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold text-primary">Gender</TableHead>
                  <TableHead className="text-right font-bold text-primary">Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {genderData.map((item) => (
                  <TableRow key={item.name} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right font-bold">{item.count}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-bold border-t-2">
                    <TableCell>Total</TableCell>
                    <TableCell className="text-right text-primary">{patients.length}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Trends Table */}
      <Card className="lg:col-span-3 border-primary/10">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Weekly Activation Trends
          </CardTitle>
          <CardDescription>Registration momentum over the last 6 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-primary/5 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold text-primary">Week Period</TableHead>
                  <TableHead className="text-right font-bold text-primary">New Activations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weeklyData.map((item) => (
                  <TableRow key={item.week} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-medium">{item.week}</TableCell>
                    <TableCell className="text-right">
                        <Badge variant={item.count > 0 ? "default" : "outline"} className={item.count > 0 ? "bg-primary text-white" : ""}>
                            {item.count} Registered
                        </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
