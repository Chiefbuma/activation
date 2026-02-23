import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: { type: string, id: string } }) {
    try {
        const { type, id } = params;
        const validTypes = ['vitals', 'nutritions', 'clinicals'];
        
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        await db.query(`DELETE FROM ${type} WHERE id = ?`, [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
