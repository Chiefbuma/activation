import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import type { Vital, Nutrition, Clinical } from '@/lib/types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const [rows] = await db.query(`
            SELECT r.*, c.name as corporate_name 
            FROM registrations r 
            LEFT JOIN corporates c ON r.corporate_id = c.id
            WHERE r.id = ?
        `, [id]);
        
        const registrations = rows as any[];
        if (registrations.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }
        
        const reg = registrations[0];
        const [vitals] = await db.query('SELECT * FROM vitals WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
        const [nutritions] = await db.query('SELECT * FROM nutritions WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
        const [clinicals] = await db.query('SELECT * FROM clinicals WHERE registration_id = ? ORDER BY created_at DESC', [reg.id]);
        
        return NextResponse.json({
            ...reg,
            vitals: vitals as Vital[],
            nutritions: nutritions as Nutrition[],
            clinicals: clinicals as Clinical[],
            status: (vitals as any[]).length > 0 ? 'Active' : 'Pending'
        });
    } catch (error) {
        console.error('GET Registration Error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
