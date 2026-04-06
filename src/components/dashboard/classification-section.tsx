'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import type { DistributionRow } from '@/lib/dashboard-metrics';

type ClassificationSectionProps = {
  index?: number;
  title: string;
  description: string;
  rows: DistributionRow[];
  measuredLabel: string;
  note?: string;
};

export default function ClassificationSection({
  index,
  title,
  description,
  rows,
  measuredLabel,
  note,
}: ClassificationSectionProps) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const totalMale = rows.reduce((sum, row) => sum + row.maleCount, 0);
  const totalFemale = rows.reduce((sum, row) => sum + row.femaleCount, 0);
  
  const chartData = total > 0 ? rows.filter((row) => row.count > 0) : rows;
  const chartConfig = Object.fromEntries(
    rows.map((row) => [row.label, { label: row.label, color: row.color }])
  );

  return (
    <div className="border border-primary/10 rounded-2xl overflow-hidden bg-white shadow-sm page-break-inside-avoid">
      <div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex items-center gap-3">
        {index && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
            {index}
          </span>
        )}
        <div>
          <h3 className="text-xs font-bold text-primary uppercase tracking-tight">{title}</h3>
          <p className="text-[9px] text-muted-foreground font-medium">{description}</p>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-[0.7fr_1.3fr] gap-6 items-center">
        {/* Chart Column (Left) */}
        <div className="flex flex-col items-center justify-center">
          <div className="h-[140px] w-full max-w-[180px]">
            <ChartContainer config={chartConfig} className="h-full w-full aspect-square">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={2}
                  stroke="none"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((row) => (
                    <Cell key={row.label} fill={row.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
          </div>
          {note && <p className="mt-2 text-[8px] text-slate-400 italic text-center px-4">{note}</p>}
        </div>

        {/* Table Column (Right) */}
        <div className="overflow-hidden rounded-xl border bg-slate-50/30">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="h-8 text-[9px] font-bold text-slate-600 uppercase">Classification</TableHead>
                <TableHead className="h-8 text-right text-[9px] font-bold text-slate-600 uppercase">M</TableHead>
                <TableHead className="h-8 text-right text-[9px] font-bold text-slate-600 uppercase">F</TableHead>
                <TableHead className="h-8 text-right text-[9px] font-bold text-slate-600 uppercase">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label} className="h-8 hover:bg-slate-100/50 border-slate-100">
                  <TableCell className="py-1 px-3 text-[10px] font-medium text-slate-700">
                    <div className="flex items-center gap-2">
                      <div style={{ backgroundColor: row.color }} className="h-1.5 w-1.5 rounded-full shrink-0" />
                      {row.label}
                    </div>
                  </TableCell>
                  <TableCell className="py-1 px-3 text-right text-[10px] font-semibold text-slate-600">{row.maleCount}</TableCell>
                  <TableCell className="py-1 px-3 text-right text-[10px] font-semibold text-slate-600">{row.femaleCount}</TableCell>
                  <TableCell className="py-1 px-3 text-right text-[10px] font-bold text-primary">{row.count}</TableCell>
                </TableRow>
              ))}
              <TableRow className="h-8 bg-slate-100/50 hover:bg-slate-100/50 border-t-2 border-slate-200">
                <TableCell className="py-1 px-3 text-[9px] font-bold text-slate-500 uppercase">
                  {measuredLabel}
                </TableCell>
                <TableCell className="py-1 px-3 text-right text-[10px] font-bold text-slate-700">{totalMale}</TableCell>
                <TableCell className="py-1 px-3 text-right text-[10px] font-bold text-slate-700">{totalFemale}</TableCell>
                <TableCell className="py-1 px-3 text-right text-[11px] font-black text-destructive">{total}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
