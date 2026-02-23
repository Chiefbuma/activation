import db from '@/lib/db';
import { NextResponse } from 'next/server';
import type { Vital, Nutrition, Clinical } from '@/lib/types';

export async function GET() {
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
            };
        }));

        return NextResponse.json(enriched);
    } catch (error) {
        console.error('GET Registrations Error:', error);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const [result] = await db.query(`
            INSERT INTO registrations (first_name, middle_name, surname, sex, dob, age, phone, email, corporate_id, wellness_date, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.first_name, data.middle_name, data.surname, data.sex, 
            data.dob || null, data.age, data.phone, data.email, 
            data.corporate_id || null, data.wellness_date || null, data.user_id || null
        ]);
        
        return NextResponse.json({ id: (result as any).insertId });
    } catch (error) {
        console.error('POST Registration Error:', error);
        return NextResponse.json({ error: 'Failed to create participant' }, { status: 500 });
    }
}
