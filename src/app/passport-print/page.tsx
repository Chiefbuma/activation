import PassportReport from '@/components/dashboard/passport-report';
import { fetchCorporates, fetchPatients } from '@/lib/data';

export const dynamic = 'force-dynamic';

type PassportPrintPageProps = {
  searchParams?: Promise<{
    corporateId?: string;
  }>;
};

export default async function PassportPrintPage({ searchParams }: PassportPrintPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const corporateId = params?.corporateId || 'all';
  const [patients, corporates] = await Promise.all([fetchPatients(), fetchCorporates()]);
  const selectedCorporate =
    corporateId === 'all' ? null : corporates.find((corporate) => String(corporate.id) === corporateId) || null;
  const filteredPatients =
    corporateId === 'all'
      ? patients
      : patients.filter((patient) => String(patient.corporate_id) === corporateId);

  return (
    <main data-pdf-export="true" className="min-h-screen bg-white px-5 py-6 md:px-8 md:py-8">
      <PassportReport
        patients={filteredPatients}
        selectedCorporate={selectedCorporate}
        className="mx-auto max-w-[1080px] space-y-8 rounded-[32px] border border-border/70 bg-card p-6 text-foreground shadow-[0_28px_70px_-40px_rgba(15,23,42,0.24)] md:p-10"
      />
    </main>
  );
}
