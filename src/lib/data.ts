import db from './db';
import type { Registration, User, Corporate, Vital, Nutrition, Clinical } from './types';
import { unstable_noStore as noStore } from 'next/cache';
import { ensureCorporateExpectedParticipantsColumn } from './corporate-schema';

/**
 * Optimized server-side data fetching functions.
 * Implementation of Bulk Fetch & Map pattern to prevent N+1 query overhead.
 */

export async function fetchPatients(): Promise<Registration[]> {
    noStore();
    try {
        const [regRows] = await db.query(`
            SELECT r.*, c.name as corporate_name 
            FROM registrations r 
            LEFT JOIN corporates c ON r.corporate_id = c.id
            ORDER BY r.created_at DESC
            LIMIT 1000
        `);
        
        const registrations = regRows as any[];
        if (registrations.length === 0) return [];

        const ids = registrations.map(r => r.id);

        const [vitalRows] = await db.query('SELECT * FROM vitals WHERE registration_id IN (?) ORDER BY created_at DESC', [ids]);
        const [nutriRows] = await db.query('SELECT * FROM nutritions WHERE registration_id IN (?) ORDER BY created_at DESC', [ids]);
        const [clinicalRows] = await db.query('SELECT * FROM clinicals WHERE registration_id IN (?) ORDER BY created_at DESC', [ids]);

        const vitals = vitalRows as Vital[];
        const nutritions = nutriRows as Nutrition[];
        const clinicals = clinicalRows as Clinical[];

        return registrations.map(reg => ({
            ...reg,
            vitals: vitals.filter(v => v.registration_id === reg.id),
            nutritions: nutritions.filter(n => n.registration_id === reg.id),
            clinicals: clinicals.filter(c => c.registration_id === reg.id),
            status: vitals.some(v => v.registration_id === reg.id) ? 'Active' : 'Pending'
        } as Registration));

    } catch (error) {
        console.error('[DATABASE_FETCH_PATIENTS_ERROR]', error);
        return [];
    }
}

export async function fetchPatientById(id: string): Promise<Registration | null> {
    noStore();
    try {
        const [rows] = await db.query(`
            SELECT r.*, c.name as corporate_name 
            FROM registrations r 
            LEFT JOIN corporates c ON r.corporate_id = c.id
            WHERE r.id = ?
        `, [id]);
        
        const registrations = rows as any[];
        if (registrations.length === 0) return null;
        
        const reg = registrations[0];
        const [v] = await db.query('SELECT * FROM vitals WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
        const [n] = await db.query('SELECT * FROM nutritions WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
        const [c] = await db.query('SELECT * FROM clinicals WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
        
        return {
            ...reg,
            vitals: v as Vital[],
            nutritions: n as Nutrition[],
            clinicals: c as Clinical[],
            status: (v as any[]).length > 0 ? 'Active' : 'Pending'
        } as Registration;
    } catch (error) {
        console.error(`[DATABASE_FETCH_PATIENT_BY_ID_ERROR] ID: ${id}`, error);
        return null;
    }
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT id, name, email, role, avatarUrl FROM users ORDER BY name ASC');
        return rows as User[];
    } catch (error) {
        console.error('[DATABASE_FETCH_USERS_ERROR]', error);
        return [];
    }
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    try {
        await ensureCorporateExpectedParticipantsColumn();
        // Removed created_at/updated_at as they may not exist in all schema versions
        const [rows] = await db.query(`
            SELECT id, name, wellness_date, expected_participants
            FROM corporates
            ORDER BY name ASC
        `);
        return rows as Corporate[];
    } catch (error) {
        try {
            const [fallbackRows] = await db.query('SELECT id, name, wellness_date, expected_participants FROM corporates ORDER BY name ASC');
            return fallbackRows as Corporate[];
        } catch (fallbackError) {
            console.error('[DATABASE_FETCH_CORPORATES_ERROR]', fallbackError);
            return [];
        }
    }
}
