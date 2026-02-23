import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            INSERT INTO vitals (registration_id, bp_systolic, bp_diastolic, pulse, temp, rbs, fbs, user_id, measured_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [data.registration_id, data.bp_systolic, data.bp_diastolic, data.pulse, data.temp, data.rbs, data.fbs, data.user_id, data.measured_at]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            UPDATE vitals SET bp_systolic=?, bp_diastolic=?, pulse=?, temp=?, rbs=?, fbs=?, measured_at=?
            WHERE id=?
        `, [data.bp_systolic, data.bp_diastolic, data.pulse, data.temp, data.rbs, data.fbs, data.measured_at, data.id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
