import db from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();
        
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const users = rows as any[];
        
        if (users.length === 0) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const user = users[0];
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Login API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
