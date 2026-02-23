import db from './db';
import type { Registration, User, Corporate, Vital, Nutrition, Clinical } from './types';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Server-side data fetching functions.
 * ONLY for use in Server Components.
 */

export async function fetchPatients(): Promise<Registration[]> {
    noStore();
    try {
        const [rows] = await db.query(`
            SELECT r.*, c.name as corporate_name 
            FROM registrations r 
            LEFT JOIN corporates c ON r.corporate_id = c.id
            ORDER BY r.created_at DESC
        `);
        
        const registrations = rows as any[];
        
        const enriched = await Promise.all(registrations.map(async (reg) => {
            const [vitals] = await db.query('SELECT * FROM vitals WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
            const [nutritions] = await db.query('SELECT * FROM nutritions WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
            const [clinicals] = await db.query('SELECT * FROM clinicals WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
            
            return {
                ...reg,
                vitals: vitals as Vital[],
                nutritions: nutritions as Nutrition[],
                clinicals: clinicals as Clinical[],
                status: (vitals as any[]).length > 0 ? 'Active' : 'Pending'
            } as Registration;
        }));

        return enriched;
    } catch (error) {
        console.error('Database Error:', error);
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
        const [vitals] = await db.query('SELECT * FROM vitals WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
        const [nutritions] = await db.query('SELECT * FROM nutritions WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
        const [clinicals] = await db.query('SELECT * FROM clinicals WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
        
        return {
            ...reg,
            vitals: vitals as Vital[],
            nutritions: nutritions as Nutrition[],
            clinicals: clinicals as Clinical[],
            status: (vitals as any[]).length > 0 ? 'Active' : 'Pending'
        } as Registration;
    } catch (error) {
        console.error('Database Error:', error);
        return null;
    }
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT id, name, email, role, avatarUrl FROM users ORDER BY name ASC');
        return rows as User[];
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM corporates ORDER BY name ASC');
        return rows as Corporate[];
    } catch (error) {
        console.error('Database Error:', error);
        return [];
    }
}
