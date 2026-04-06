'use client';

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
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';
import type { DistributionRow } from '@/lib/dashboard-metrics';

type ClassificationSectionProps = {
  title: string;
  description: string;
  rows: DistributionRow[];
  measuredLabel: string;
  note?: string;
};

export default function ClassificationSection({
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
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
        <div className="overflow-hidden rounded-xl border border-primary/10 bg-muted/20">
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                <TableHead className="font-bold text-primary">Classification</TableHead>
                <TableHead className="text-right font-bold text-primary">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.label} className="hover:bg-primary/5">
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: row.color }}
                      />
                      {row.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{row.count}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-background/80 hover:bg-background/80">
                <TableCell className="font-semibold text-muted-foreground">
                  {measuredLabel}
                </TableCell>
                <TableCell className="text-right font-bold">{total}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl border border-primary/10 bg-background p-4">
          <div className="h-[250px]">
            <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={3}
                >
                  {chartData.map((row) => (
                    <Cell key={row.label} fill={row.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              {rows.map((row) => (
                <span
                  key={row.label}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/10 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: row.color }}
                  />
                  {row.label}
                </span>
              ))}
            </div>
            <p className="text-sm font-medium text-foreground">
              {total > 0 ? `${total} participants classified` : 'No screening data captured yet'}
            </p>
            {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
