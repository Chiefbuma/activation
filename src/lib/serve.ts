import type { Registration, Corporate, User, Vital, Nutrition, Clinical } from '@/lib/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic function to handle API responses and extract error messages
async function getErrorFromResponse(response: Response): Promise<Error> {
    try {
        const errorData = await response.json();
        return new Error(errorData.error || errorData.message || 'An unknown error occurred.');
    } catch {
        return new Error(`Request failed with status ${response.status}.`);
    }
}

// --- Auth Functions ---

export async function login(credentials: {email: string, password: string}): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

// --- Registration Functions ---

export async function getRegistrations(): Promise<Registration[]> {
    const res = await fetch(`${API_BASE}/registrations`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function getRegistrationById(id: string): Promise<Registration> {
    const res = await fetch(`${API_BASE}/registrations/${id}`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function createRegistration(data: Partial<Registration>): Promise<{id: number}> {
    const res = await fetch(`${API_BASE}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

// --- Assessment Mutations ---

export async function saveVital(data: Partial<Vital>): Promise<void> {
    const res = await fetch(`${API_BASE}/vitals`, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function saveNutrition(data: Partial<Nutrition>): Promise<void> {
    const res = await fetch(`${API_BASE}/nutritions`, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function saveClinical(data: Partial<Clinical>): Promise<void> {
    const res = await fetch(`${API_BASE}/clinicals`, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function deleteAssessment(type: 'vitals' | 'nutritions' | 'clinicals', id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/assessments/${type}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

// --- Corporate Mutations ---

export async function getCorporates(): Promise<Corporate[]> {
    const res = await fetch(`${API_BASE}/corporates`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function saveCorporate(data: Partial<Corporate>): Promise<void> {
    const res = await fetch(`${API_BASE}/corporates`, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function deleteCorporate(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/corporates?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

// --- User Mutations ---

export async function getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`, { cache: 'no-store' });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function saveUser(data: Partial<User>): Promise<void> {
    const res = await fetch(`${API_BASE}/users`, {
        method: data.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function deleteUser(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/users?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}
