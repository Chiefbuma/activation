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

export default async function PatientPage({ params }: { params: { id: string } }) {
  const patient = await getPatientData(params.id);
  
  if (!patient) {
    notFound();
  }
  
  // Directly return the details page as self-onboarding is removed
  return <PatientDetailsPage initialPatient={patient} />;
}
