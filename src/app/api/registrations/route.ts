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
            LIMIT 1000
        `);
        
        const registrations = rows as any[];
        if (registrations.length === 0) return NextResponse.json([]);

        const ids = registrations.map(r => r.id);

        // Optimized Bulk Fetch
        const [vitals] = await db.query('SELECT * FROM vitals WHERE registration_id IN (?) ORDER BY created_at DESC', [ids]);
        const [nutritions] = await db.query('SELECT * FROM nutritions WHERE registration_id IN (?) ORDER BY created_at DESC', [ids]);
        const [clinicals] = await db.query('SELECT * FROM clinicals WHERE registration_id IN (?) ORDER BY created_at DESC', [ids]);

        const enriched = registrations.map(reg => ({
            ...reg,
            vitals: (vitals as Vital[]).filter(v => v.registration_id === reg.id),
            nutritions: (nutritions as Nutrition[]).filter(n => n.registration_id === reg.id),
            clinicals: (clinicals as Clinical[]).filter(c => c.registration_id === reg.id),
            status: (vitals as Vital[]).some(v => v.registration_id === reg.id) ? 'Active' : 'Pending'
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

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        await db.query('DELETE FROM registrations WHERE id=?', [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE Registration Error:', error);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
