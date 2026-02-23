import db from '@/lib/db';
import { NextResponse } from 'next/server';

const toNum = (val: any) => {
    if (val === undefined || val === null || val === '') return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
};

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            INSERT INTO clinicals (registration_id, counselling_sessions, verbal_stress_rating, conclusion, doctor_notes, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            toNum(data.registration_id), 
            data.counselling_sessions || null, 
            toNum(data.verbal_stress_rating), 
            data.conclusion || null, 
            data.doctor_notes || null, 
            toNum(data.user_id)
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
            toNum(data.verbal_stress_rating), 
            data.conclusion || null, 
            data.doctor_notes || null, 
            toNum(data.id)
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Clinical PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update: ' + error.message }, { status: 500 });
    }
}
