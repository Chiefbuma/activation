import db from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET() {
    const [rows] = await db.query('SELECT id, name, email, role, avatarUrl FROM users ORDER BY name ASC');
    return NextResponse.json(rows);
}

export async function POST(request: Request) {
    const data = await request.json();
    const hashed = await bcrypt.hash(data.password, 10);
    await db.query('INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)', [data.name, data.email, data.role, hashed]);
    return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
    const data = await request.json();
    if (data.password) {
        const hashed = await bcrypt.hash(data.password, 10);
        await db.query('UPDATE users SET name=?, email=?, role=?, password=? WHERE id=?', [data.name, data.email, data.role, hashed, data.id]);
    } else {
        await db.query('UPDATE users SET name=?, email=?, role=? WHERE id=?', [data.name, data.email, data.role, data.id]);
    }
    return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await db.query('DELETE FROM users WHERE id=?', [id]);
    return NextResponse.json({ success: true });
}
