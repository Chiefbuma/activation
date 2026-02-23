import db from '@/lib/db';
import { NextResponse } from 'next/server';

const toNum = (val: any) => {
    if (val === undefined || val === null || val === '') return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
};

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await db.query(`
            INSERT INTO nutritions (registration_id, height, weight, bmi, llw, ulw, excess_weight, visceral_fat, body_fat_percent, meal_plan, weight_loss_period, notes_nutritionist, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            toNum(data.registration_id), 
            toNum(data.height), 
            toNum(data.weight), 
            toNum(data.bmi), 
            toNum(data.llw), 
            toNum(data.ulw), 
            toNum(data.excess_weight),
            toNum(data.visceral_fat),
            toNum(data.body_fat_percent),
            data.meal_plan || null, 
            data.weight_loss_period || null,
            data.notes_nutritionist || null,
            toNum(data.user_id)
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
            UPDATE nutritions SET height=?, weight=?, bmi=?, llw=?, ulw=?, excess_weight=?, visceral_fat=?, body_fat_percent=?, meal_plan=?, weight_loss_period=?, notes_nutritionist=?
            WHERE id=?
        `, [
            toNum(data.height), 
            toNum(data.weight), 
            toNum(data.bmi), 
            toNum(data.llw), 
            toNum(data.ulw), 
            toNum(data.excess_weight), 
            toNum(data.visceral_fat), 
            toNum(data.body_fat_percent), 
            data.meal_plan || null, 
            data.weight_loss_period || null, 
            data.notes_nutritionist || null,
            toNum(data.id)
        ]);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Nutrition PUT Error:', error);
        return NextResponse.json({ error: 'Failed to update: ' + error.message }, { status: 500 });
    }
}
