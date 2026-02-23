import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            INSERT INTO clinicals (registration_id, counselling_sessions, verbal_stress_rating, conclusion, doctor_notes, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            data.registration_id ? Number(data.registration_id) : null, 
            data.counselling_sessions || null, 
            data.verbal_stress_rating ? Number(data.verbal_stress_rating) : null, 
            data.conclusion || null, 
            data.doctor_notes || null, 
            data.user_id ? Number(data.user_id) : null
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Clinical POST Error:', error);
        return NextResponse.json({ error: 'Failed to save: ' + error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            UPDATE clinicals SET counselling_sessions=?, verbal_stress_rating=?, conclusion=?, doctor_notes=?
            WHERE id=?
        `, [
            data.counselling_sessions || null, 
            data.verbal_stress_rating ? Number(data.verbal_stress_rating) : null, 
            data.conclusion || null, 
            data.doctor_notes || null, 
            data.id ? Number(data.id) : null
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Clinical PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update: ' + error.message }, { status: 500 });
    }
}
