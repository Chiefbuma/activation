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
            SELECT id, name, wellness_date, expected_participants
            FROM corporates
            ORDER BY name ASC
        `);
        return NextResponse.json(rows);
    } catch (error) {
        try {
            const [rows] = await db.query('SELECT id, name, wellness_date, expected_participants FROM corporates ORDER BY name ASC');
            return NextResponse.json(rows);
        } catch (innerError) {
            const [rows] = await db.query('SELECT id, name, wellness_date FROM corporates ORDER BY name ASC');
            return NextResponse.json(rows);
        }
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await ensureCorporateExpectedParticipantsColumn();
        await db.query(
            'INSERT INTO corporates (name, wellness_date, expected_participants) VALUES (?, ?, ?)',
            [data.name, data.wellness_date, toNum(data.expected_participants)]
        );
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        await ensureCorporateExpectedParticipantsColumn();
        await db.query(
            'UPDATE corporates SET name=?, wellness_date=?, expected_participants=? WHERE id=?',
            [data.name, data.wellness_date, toNum(data.expected_participants), data.id]
        );
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        await db.query('DELETE FROM corporates WHERE id=?', [id]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
