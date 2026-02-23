import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        const mysqlDate = data.measured_at 
            ? new Date(data.measured_at).toISOString().slice(0, 19).replace('T', ' ')
            : new Date().toISOString().slice(0, 19).replace('T', ' ');

        await db.query(`
            INSERT INTO vitals (registration_id, bp_systolic, bp_diastolic, pulse, temp, rbs, fbs, user_id, measured_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.registration_id ? Number(data.registration_id) : null, 
            data.bp_systolic ? Number(data.bp_systolic) : null, 
            data.bp_diastolic ? Number(data.bp_diastolic) : null, 
            data.pulse ? Number(data.pulse) : null, 
            data.temp ? Number(data.temp) : null, 
            data.rbs || null, 
            data.fbs || null, 
            data.user_id ? Number(data.user_id) : null, 
            mysqlDate
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Vitals POST Error:', error);
        return NextResponse.json({ error: 'Failed to save: ' + error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const mysqlDate = data.measured_at 
            ? new Date(data.measured_at).toISOString().slice(0, 19).replace('T', ' ')
            : new Date().toISOString().slice(0, 19).replace('T', ' ');

        await db.query(`
            UPDATE vitals SET bp_systolic=?, bp_diastolic=?, pulse=?, temp=?, rbs=?, fbs=?, measured_at=?
            WHERE id=?
        `, [
            data.bp_systolic ? Number(data.bp_systolic) : null, 
            data.bp_diastolic ? Number(data.bp_diastolic) : null, 
            data.pulse ? Number(data.pulse) : null, 
            data.temp ? Number(data.temp) : null, 
            data.rbs || null, 
            data.fbs || null, 
            mysqlDate, 
            data.id ? Number(data.id) : null
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Vitals PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update: ' + error.message }, { status: 500 });
    }
}
