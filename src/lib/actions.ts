'use server';

import db from './db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import type { Registration, Vital, Nutrition, Clinical } from './types';

/**
 * Server Actions for data mutations.
 */

const toNum = (val: any) => {
    if (val === undefined || val === null || val === '') return null;
    const n = parseFloat(val);
    return isNaN(n) ? null : n;
};

export async function loginUser(email: string, password: string) {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const users = rows as any[];
        
        if (users.length === 0) {
            return { error: 'Invalid credentials' };
        }

        const user = users[0];
        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
            return { error: 'Invalid credentials' };
        }

        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword };
    } catch (error) {
        return { error: 'Something went wrong' };
    }
}

export async function registerParticipant(data: Partial<Registration>) {
    try {
        const [result] = await db.query(`
            INSERT INTO registrations (first_name, middle_name, surname, sex, dob, age, phone, email, corporate_id, wellness_date, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.first_name, data.middle_name, data.surname, data.sex, 
            data.dob || null, data.age, data.phone, data.email, 
            data.corporate_id || null, data.wellness_date || null, data.user_id || null
        ]);
        
        revalidatePath('/dashboard');
        return { success: true, id: (result as any).insertId };
    } catch (error) {
        console.error('Registration Error:', error);
        return { error: 'Failed to register participant' };
    }
}

export async function saveVital(data: Partial<Vital>) {
    try {
        if (data.id) {
            await db.query(`
                UPDATE vitals SET bp_systolic=?, bp_diastolic=?, pulse=?, temp=?, rbs=?, fbs=?, measured_at=?
                WHERE id=?
            `, [toNum(data.bp_systolic), toNum(data.bp_diastolic), toNum(data.pulse), toNum(data.temp), data.rbs || null, data.fbs || null, data.measured_at, data.id]);
        } else {
            await db.query(`
                INSERT INTO vitals (registration_id, bp_systolic, bp_diastolic, pulse, temp, rbs, fbs, user_id, measured_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [toNum(data.registration_id), toNum(data.bp_systolic), toNum(data.bp_diastolic), toNum(data.pulse), toNum(data.temp), data.rbs || null, data.fbs || null, toNum(data.user_id), data.measured_at]);
        }
        revalidatePath(`/dashboard/patient/${data.registration_id}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to save vitals' };
    }
}

export async function saveNutrition(data: Partial<Nutrition>) {
    try {
        if (data.id) {
            await db.query(`
                UPDATE nutritions SET height=?, weight=?, bmi=?, llw=?, ulw=?, excess_weight=?, visceral_fat=?, body_fat_percent=?, meal_plan=?, weight_loss_period=?, notes_nutritionist=?
                WHERE id=?
            `, [toNum(data.height), toNum(data.weight), toNum(data.bmi), toNum(data.llw), toNum(data.ulw), toNum(data.excess_weight), toNum(data.visceral_fat), toNum(data.body_fat_percent), data.meal_plan || null, data.weight_loss_period || null, data.notes_nutritionist || null, data.id]);
        } else {
            await db.query(`
                INSERT INTO nutritions (registration_id, height, weight, bmi, llw, ulw, excess_weight, visceral_fat, body_fat_percent, meal_plan, weight_loss_period, notes_nutritionist, user_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [toNum(data.registration_id), toNum(data.height), toNum(data.weight), toNum(data.bmi), toNum(data.llw), toNum(data.ulw), toNum(data.excess_weight), toNum(data.visceral_fat), toNum(data.body_fat_percent), data.meal_plan || null, data.weight_loss_period || null, data.notes_nutritionist || null, toNum(data.user_id)]);
        }
        revalidatePath(`/dashboard/patient/${data.registration_id}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to save nutrition' };
    }
}

export async function saveClinical(data: Partial<Clinical>) {
    try {
        if (data.id) {
            await db.query(`
                UPDATE clinicals SET counselling_sessions=?, verbal_stress_rating=?, conclusion=?, doctor_notes=?
                WHERE id=?
            `, [data.counselling_sessions, toNum(data.verbal_stress_rating), data.conclusion, data.doctor_notes, data.id]);
        } else {
            await db.query(`
                INSERT INTO clinicals (registration_id, counselling_sessions, verbal_stress_rating, conclusion, doctor_notes, user_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [toNum(data.registration_id), data.counselling_sessions, toNum(data.verbal_stress_rating), data.conclusion, data.doctor_notes, toNum(data.user_id)]);
        }
        revalidatePath(`/dashboard/patient/${data.registration_id}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to save clinical review' };
    }
}

export async function deleteAssessment(type: 'vitals' | 'nutritions' | 'clinicals', id: number, registrationId: number) {
    try {
        await db.query(`DELETE FROM ${type} WHERE id = ?`, [id]);
        revalidatePath(`/dashboard/patient/${registrationId}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete record' };
    }
}
