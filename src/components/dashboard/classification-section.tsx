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
  const chartData = total > 0 ? rows.filter((row) => row.count > 0) : rows;
  const chartConfig = Object.fromEntries(
    rows.map((row) => [row.label, { label: row.label, color: row.color }])
  );

  return (
    <div className="border border-[#31519a]/20 rounded-2xl overflow-hidden bg-white group hover:border-[#31519a]/40 transition-colors">
      <div className="bg-[#31519a]/5 px-4 py-3 border-b border-[#31519a]/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {index && (
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#31519a] text-white text-[10px] font-bold">
              {index}
            </span>
          )}
          <div>
            <h3 className="text-[13px] font-bold text-[#1e3a8a] uppercase tracking-wider">{title}</h3>
            <p className="text-[10px] text-slate-500 font-medium">{description}</p>
          </div>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-4 items-center">
        <div className="overflow-hidden rounded-lg border bg-slate-50/50">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="h-8 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Classification</TableHead>
                <TableHead className="h-8 text-right text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label} className="h-8 hover:bg-slate-100/50 border-slate-100">
                  <TableCell className="py-1 px-3 text-[11px] font-medium text-slate-700">
                    <span className="inline-flex items-center gap-2">
                      <span
                        style={{ backgroundColor: row.color }}
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                      />
                      {row.label}
                    </span>
                  </TableCell>
                  <TableCell className="py-1 px-3 text-right text-[11px] font-bold text-[#1e3a8a]">{row.count}</TableCell>
                </TableRow>
              ))}
              <TableRow className="h-8 bg-slate-100/30 hover:bg-slate-100/30 border-t-2 border-slate-200">
                <TableCell className="py-1 px-3 text-[10px] font-bold text-slate-500 uppercase">
                  {measuredLabel}
                </TableCell>
                <TableCell className="py-1 px-3 text-right text-[12px] font-extrabold text-[#dc2626]">{total}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="h-[120px] w-full">
            <ChartContainer config={chartConfig} className="h-full w-full aspect-square mx-auto">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={35}
                  outerRadius={50}
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map((row) => (
                    <Cell key={row.label} fill={row.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
          </div>
          {note && <p className="mt-2 text-[9px] text-slate-400 leading-tight text-center px-2">{note}</p>}
        </div>
      </div>
    </div>
  );
}
