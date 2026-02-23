import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            INSERT INTO nutritions (registration_id, height, weight, bmi, llw, ulw, excess_weight, meal_plan, weight_loss_period, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [data.registration_id, data.height, data.weight, data.bmi, data.llw, data.ulw, data.excess_weight, data.meal_plan, data.weight_loss_period, data.user_id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            UPDATE nutritions SET height=?, weight=?, bmi=?, llw=?, ulw=?, excess_weight=?, meal_plan=?, weight_loss_period=?
            WHERE id=?
        `, [data.height, data.weight, data.bmi, data.llw, data.ulw, data.excess_weight, data.meal_plan, data.weight_loss_period, data.id]);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
