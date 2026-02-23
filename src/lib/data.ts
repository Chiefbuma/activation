import type { Registration, User, Corporate } from './types';
import { unstable_noStore as noStore } from 'next/cache';
import { 
    registrations as mockRegistrations, 
    users as mockUsers,
    corporates as mockCorporates,
    vitals as mockVitals,
    nutritions as mockNutritions,
    clinicals as mockClinicals
} from './mock-data';

export async function fetchPatients(): Promise<Registration[]> {
    noStore();
    
    const enriched = mockRegistrations.map(reg => {
        const corporate = mockCorporates.find(c => c.id === reg.corporate_id);
        const regVitals = mockVitals.filter(v => v.registration_id === reg.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const regNutritions = mockNutritions.filter(n => n.registration_id === reg.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const regClinicals = mockClinicals.filter(c => c.registration_id === reg.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
            ...reg,
            corporate_name: corporate?.name,
            vitals: regVitals,
            nutritions: regNutritions,
            clinicals: regClinicals,
            status: 'Active' // Participants are active once registered
        } as Registration;
    });

    return enriched.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchPatientById(id: string): Promise<Registration | null> {
    noStore();
    
    const reg = mockRegistrations.find(r => r.id === parseInt(id));

    if (!reg) {
        return null;
    }

    const corporate = mockCorporates.find(c => c.id === reg.corporate_id);
    const regVitals = mockVitals.filter(v => v.registration_id === reg.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const regNutritions = mockNutritions.filter(n => n.registration_id === reg.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const regClinicals = mockClinicals.filter(c => c.registration_id === reg.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
        ...reg,
        corporate_name: corporate?.name,
        vitals: regVitals,
        nutritions: regNutritions,
        clinicals: regClinicals,
        status: 'Active'
    } as Registration;
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    return mockUsers;
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    return mockCorporates.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchClinicalParameters() {
    return [
        { id: 1, name: 'Blood Pressure', type: 'numeric', unit: 'mmHg' },
        { id: 2, name: 'Heart Rate', type: 'numeric', unit: 'bpm' },
        { id: 3, name: 'Weight', type: 'numeric', unit: 'kg' },
        { id: 4, name: 'Height', type: 'numeric', unit: 'cm' },
    ];
}
