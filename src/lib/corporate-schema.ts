import db from './db';

let expectedParticipantsChecked = false;

const SAFE_SCHEMA_ERRORS = new Set([
  'ER_DUP_FIELDNAME',
  'ER_TABLEACCESS_DENIED_ERROR',
  'ER_COLUMNACCESS_DENIED_ERROR',
]);

export async function ensureCorporateExpectedParticipantsColumn() {
  if (expectedParticipantsChecked) return;

  try {
    await db.query(
      'ALTER TABLE corporates ADD COLUMN expected_participants INT NULL AFTER wellness_date'
    );
  } catch (error: any) {
    if (!SAFE_SCHEMA_ERRORS.has(error?.code)) {
      console.warn('[CORPORATE_SCHEMA_WARNING]', error);
    }
  } finally {
    expectedParticipantsChecked = true;
  }
}
