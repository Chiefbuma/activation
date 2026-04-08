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
import { Cell, Pie, PieChart } from 'recharts';
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
    <div className="overflow-hidden rounded-[28px] border border-border/70 bg-card shadow-[0_22px_55px_-38px_rgba(15,23,42,0.22)] page-break-inside-avoid transition-colors dark:bg-card">
      <div className="flex items-start gap-3 border-b border-border/70 bg-primary/5 px-5 py-4 dark:bg-primary/10">
        {index && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[12px] font-bold text-primary-foreground shadow-sm">
            {index}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
            {title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-2 text-center dark:bg-muted/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                Total
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{total}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-2 text-center dark:bg-muted/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                Male
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{totalMale}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 px-3 py-2 text-center dark:bg-muted/20">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
                Female
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{totalFemale}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center rounded-[24px] border border-border/60 bg-muted/15 px-4 py-5 dark:bg-muted/15">
            <div className="h-[150px] w-full max-w-[180px]">
              <ChartContainer config={chartConfig} className="aspect-square h-full w-full">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={42}
                    outerRadius={66}
                    paddingAngle={2}
                    stroke="none"
                    labelLine={false}
                    label={({ percent }) => (percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : '')}
                  >
                    {chartData.map((row) => (
                      <Cell key={row.label} fill={row.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
              </ChartContainer>
            </div>
            {note && (
              <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
                {note}
              </p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-border/60 bg-muted/15 dark:bg-muted/15">
          <div className="overflow-x-auto">
            <Table className="min-w-[460px]">
              <TableHeader className="bg-muted/30 dark:bg-muted/25">
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="h-10 px-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Classification
                  </TableHead>
                  <TableHead className="h-10 w-16 px-3 text-right text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    M
                  </TableHead>
                  <TableHead className="h-10 w-16 px-3 text-right text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    F
                  </TableHead>
                  <TableHead className="h-10 w-20 px-3 text-right text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Total
                  </TableHead>
                  <TableHead className="h-10 w-20 px-3 text-right text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Share
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const share = total > 0 ? (row.count / total) * 100 : 0;

                  return (
                    <TableRow key={row.label} className="border-border/50 hover:bg-muted/25">
                      <TableCell className="px-3 py-2.5 text-[14px] font-medium text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div
                            style={{ backgroundColor: row.color }}
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                          />
                          <span className="truncate">{row.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-[14px] font-medium tabular-nums text-muted-foreground">
                        {row.maleCount}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-[14px] font-medium tabular-nums text-muted-foreground">
                        {row.femaleCount}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-[14px] font-semibold tabular-nums text-foreground">
                        {row.count}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right text-[14px] font-semibold tabular-nums text-primary">
                        {share.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-border/60 bg-muted/30 hover:bg-muted/30">
                  <TableCell className="px-3 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {measuredLabel}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right text-[14px] font-semibold tabular-nums text-foreground">
                    {totalMale}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right text-[14px] font-semibold tabular-nums text-foreground">
                    {totalFemale}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right text-[15px] font-semibold tabular-nums text-foreground">
                    {total}
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right text-[15px] font-semibold tabular-nums text-primary">
                    100.0%
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
