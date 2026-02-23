import { fetchPatientById } from '@/lib/data';
import { notFound } from 'next/navigation';
import PatientDetailsPage from './patient-details-page';
import OnboardingForm from './onboarding-form';

async function getPatientData(id: string) {
    try {
        const patient = await fetchPatientById(id);
        return patient;
    } catch (error) {
        console.error("Failed to fetch patient data:", error);
        return null;
    }
}

export default async function PatientPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const patient = await getPatientData(id);
  
  if (!patient) {
    notFound();
  }
  
  if (patient.status === 'Pending') {
      return <OnboardingForm patient={patient} />;
  }

  return <PatientDetailsPage initialPatient={patient} />;
}
