import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, context: { params: Promise<{ type: string, id: string }> }) {
    try {
        // Next.js 15 requires awaiting params
        const { type, id } = await context.params;
        const validTypes = ['vitals', 'nutritions', 'clinicals'];
        
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        await db.query(`DELETE FROM ${type} WHERE id = ?`, [id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete Assessment Error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
