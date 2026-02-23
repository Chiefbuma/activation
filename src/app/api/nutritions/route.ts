import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            INSERT INTO nutritions (registration_id, height, weight, bmi, llw, ulw, excess_weight, visceral_fat, body_fat_percent, meal_plan, weight_loss_period, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.registration_id ? Number(data.registration_id) : null, 
            data.height ? Number(data.height) : null, 
            data.weight ? Number(data.weight) : null, 
            data.bmi ? Number(data.bmi) : null, 
            data.llw ? Number(data.llw) : null, 
            data.ulw ? Number(data.ulw) : null, 
            data.excess_weight ? Number(data.excess_weight) : null,
            data.visceral_fat ? Number(data.visceral_fat) : null,
            data.body_fat_percent ? Number(data.body_fat_percent) : null,
            data.meal_plan || null, 
            data.weight_loss_period || null, 
            data.user_id ? Number(data.user_id) : null
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Nutrition POST Error:', error);
        return NextResponse.json({ error: 'Failed to save: ' + error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            UPDATE nutritions SET height=?, weight=?, bmi=?, llw=?, ulw=?, excess_weight=?, visceral_fat=?, body_fat_percent=?, meal_plan=?, weight_loss_period=?
            WHERE id=?
        `, [
            data.height ? Number(data.height) : null, 
            data.weight ? Number(data.weight) : null, 
            data.bmi ? Number(data.bmi) : null, 
            data.llw ? Number(data.llw) : null, 
            data.ulw ? Number(data.ulw) : null, 
            data.excess_weight ? Number(data.excess_weight) : null, 
            data.visceral_fat ? Number(data.visceral_fat) : null,
            data.body_fat_percent ? Number(data.body_fat_percent) : null,
            data.meal_plan || null, 
            data.weight_loss_period || null, 
            data.id ? Number(data.id) : null
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Nutrition PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update: ' + error.message }, { status: 500 });
    }
}
