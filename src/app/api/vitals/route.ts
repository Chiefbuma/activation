import db from '@/lib/db';
import { NextResponse } from 'next/server';

const toSqlDate = (dateStr?: string) => {
    try {
        const date = dateStr ? new Date(dateStr) : new Date();
        if (isNaN(date.getTime())) return new Date().toISOString().slice(0, 19).replace('T', ' ');
        // Strips T and Z and milliseconds for MySQL DATETIME compatibility
        return date.toISOString().slice(0, 19).replace('T', ' ');
    } catch {
        return new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
};

const toNum = (val: any) => {
    if (val === undefined || val === null || val === '') return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
};

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const mysqlDate = toSqlDate(data.measured_at);

        if (!toNum(data.registration_id)) {
            return NextResponse.json({ error: 'Registration ID is required' }, { status: 400 });
        }

        await db.query(`
            INSERT INTO vitals (registration_id, bp_systolic, bp_diastolic, pulse, temp, rbs, fbs, user_id, measured_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            toNum(data.registration_id), 
            toNum(data.bp_systolic), 
            toNum(data.bp_diastolic), 
            toNum(data.pulse), 
            toNum(data.temp), 
            (data.rbs !== undefined && data.rbs !== null && data.rbs !== '') ? String(data.rbs) : null, 
            (data.fbs !== undefined && data.fbs !== null && data.fbs !== '') ? String(data.fbs) : null, 
            toNum(data.user_id), 
            mysqlDate
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Vitals POST Error:', error);
        return NextResponse.json({ error: 'Failed to save record: ' + error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        const mysqlDate = toSqlDate(data.measured_at);

        if (!toNum(data.id)) {
            return NextResponse.json({ error: 'Record ID is required' }, { status: 400 });
        }

        await db.query(`
            UPDATE vitals SET bp_systolic=?, bp_diastolic=?, pulse=?, temp=?, rbs=?, fbs=?, measured_at=?
            WHERE id=?
        `, [
            toNum(data.bp_systolic), 
            toNum(data.bp_diastolic), 
            toNum(data.pulse), 
            toNum(data.temp), 
            (data.rbs !== undefined && data.rbs !== null && data.rbs !== '') ? String(data.rbs) : null, 
            (data.fbs !== undefined && data.fbs !== null && data.fbs !== '') ? String(data.fbs) : null, 
            mysqlDate, 
            toNum(data.id)
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Vitals PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update record: ' + error.message }, { status: 500 });
    }
}
