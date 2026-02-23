import { fetchPatientById } from '@/lib/data';
import { notFound } from 'next/navigation';
import PatientDetailsPage from './patient-details-page';

async function getPatientData(id: string) {
    try {
        const patient = await fetchPatientById(id);
        return patient;
    } catch (error) {
        console.error("Failed to fetch participant data:", error);
        return null;
    }
}

export default async function PatientPage(props: { params: Promise<{ id: string }> }) {
  // Next.js 15 requires awaiting params
  const { id } = await props.params;
  const patient = await getPatientData(id);
  
  if (!patient) {
    notFound();
  }
  
  return <PatientDetailsPage initialPatient={patient} />;
}
