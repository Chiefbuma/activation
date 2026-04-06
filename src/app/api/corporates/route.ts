import db from '@/lib/db';
import { NextResponse } from 'next/server';
import { ensureCorporateExpectedParticipantsColumn } from '@/lib/corporate-schema';

const toNum = (value: unknown) => {
    if (value === undefined || value === null || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

export async function GET() {
    try {
        await ensureCorporateExpectedParticipantsColumn();
        const [rows] = await db.query(`
            SELECT id, name, wellness_date, expected_participants, created_at, updated_at
            FROM corporates
            ORDER BY name ASC
        `);
        return NextResponse.json(rows);
    } catch (error) {
        const [rows] = await db.query('SELECT * FROM corporates ORDER BY name ASC');
        return NextResponse.json(rows);
    }
}

export async function POST(request: Request) {
    const data = await request.json();
    try {
        await ensureCorporateExpectedParticipantsColumn();
        await db.query(
            'INSERT INTO corporates (name, wellness_date, expected_participants) VALUES (?, ?, ?)',
            [data.name, data.wellness_date, toNum(data.expected_participants)]
        );
    } catch (error: any) {
        if (error?.code === 'ER_BAD_FIELD_ERROR') {
            await db.query('INSERT INTO corporates (name, wellness_date) VALUES (?, ?)', [data.name, data.wellness_date]);
        } else {
            throw error;
        }
    }
    return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
    const data = await request.json();
    try {
        await ensureCorporateExpectedParticipantsColumn();
        await db.query(
            'UPDATE corporates SET name=?, wellness_date=?, expected_participants=? WHERE id=?',
            [data.name, data.wellness_date, toNum(data.expected_participants), data.id]
        );
    } catch (error: any) {
        if (error?.code === 'ER_BAD_FIELD_ERROR') {
            await db.query('UPDATE corporates SET name=?, wellness_date=? WHERE id=?', [data.name, data.wellness_date, data.id]);
        } else {
            throw error;
        }
    }
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await db.query('DELETE FROM corporates WHERE id=?', [id]);
    return NextResponse.json({ success: true });
}
