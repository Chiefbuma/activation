import db from '@/lib/db';
import { NextResponse } from 'next/server';

const formatMySQLDate = (dateStr?: string) => {
    try {
        const date = dateStr ? new Date(dateStr) : new Date();
        return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
};

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const mysqlDate = formatMySQLDate(data.measured_at);

        await db.query(`
            INSERT INTO vitals (registration_id, bp_systolic, bp_diastolic, pulse, temp, rbs, fbs, user_id, measured_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.registration_id ? Number(data.registration_id) : null, 
            data.bp_systolic !== undefined && data.bp_systolic !== null ? Number(data.bp_systolic) : null, 
            data.bp_diastolic !== undefined && data.bp_diastolic !== null ? Number(data.bp_diastolic) : null, 
            data.pulse !== undefined && data.pulse !== null ? Number(data.pulse) : null, 
            data.temp !== undefined && data.temp !== null ? Number(data.temp) : null, 
            data.rbs ? String(data.rbs) : null, 
            data.fbs ? String(data.fbs) : null, 
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
        const mysqlDate = formatMySQLDate(data.measured_at);

        await db.query(`
            UPDATE vitals SET bp_systolic=?, bp_diastolic=?, pulse=?, temp=?, rbs=?, fbs=?, measured_at=?
            WHERE id=?
        `, [
            data.bp_systolic !== undefined && data.bp_systolic !== null ? Number(data.bp_systolic) : null, 
            data.bp_diastolic !== undefined && data.bp_diastolic !== null ? Number(data.bp_diastolic) : null, 
            data.pulse !== undefined && data.pulse !== null ? Number(data.pulse) : null, 
            data.temp !== undefined && data.temp !== null ? Number(data.temp) : null, 
            data.rbs ? String(data.rbs) : null, 
            data.fbs ? String(data.fbs) : null, 
            mysqlDate, 
            data.id ? Number(data.id) : null
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Vitals PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update: ' + error.message }, { status: 500 });
    }
}
