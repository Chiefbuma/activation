import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            INSERT INTO clinicals (registration_id, counselling_sessions, verbal_stress_rating, conclusion, doctor_notes, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [data.registration_id, data.counselling_sessions, data.verbal_stress_rating, data.conclusion, data.doctor_notes, data.user_id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            UPDATE clinicals SET counselling_sessions=?, verbal_stress_rating=?, conclusion=?, doctor_notes=?
            WHERE id=?
        `, [data.counselling_sessions, data.verbal_stress_rating, data.conclusion, data.doctor_notes, data.id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
