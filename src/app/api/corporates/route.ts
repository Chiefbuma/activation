import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const [rows] = await db.query('SELECT * FROM corporates ORDER BY name ASC');
    return NextResponse.json(rows);
}

export async function POST(request: Request) {
    const data = await request.json();
    await db.query('INSERT INTO corporates (name, wellness_date) VALUES (?, ?)', [data.name, data.wellness_date]);
    return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
    const data = await request.json();
    await db.query('UPDATE corporates SET name=?, wellness_date=? WHERE id=?', [data.name, data.wellness_date, data.id]);
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await db.query('DELETE FROM corporates WHERE id=?', [id]);
    return NextResponse.json({ success: true });
}
