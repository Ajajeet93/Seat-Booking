const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseDateOnly,
  getActiveBatchForDate,
  getRotationForDate,
  evaluateBookingWindow,
  formatDateKey,
} = require('../services/bookingPolicy');

test('rotation: odd week Mon-Wed -> Batch 1, Thu-Fri -> Batch 2', () => {
  const mon = parseDateOnly('2026-01-05'); // ISO week 2 usually even, use explicit check through function
  const thu = parseDateOnly('2026-01-08');

  const monRotation = getRotationForDate(mon);
  const thuRotation = getRotationForDate(thu);

  if (monRotation.weekNumber % 2 === 1) {
    assert.equal(getActiveBatchForDate(mon), 1);
    assert.equal(getActiveBatchForDate(thu), 2);
  } else {
    assert.equal(getActiveBatchForDate(mon), 2);
    assert.equal(getActiveBatchForDate(thu), 1);
  }
});

test('batch day allows designated booking up to 14 days', () => {
  const now = new Date(2026, 2, 2, 10, 0, 0); // Mar 2, 2026
  const target = new Date(now);
  target.setDate(target.getDate() + 14);

  const activeBatch = getActiveBatchForDate(target);
  const result = evaluateBookingWindow({ targetDate: target, userBatch: activeBatch, now });

  assert.equal(result.ok, true);
});

test('batch day rejects designated booking beyond 14 days', () => {
  const now = new Date(2026, 2, 2, 10, 0, 0);
  const target = new Date(now);
  target.setDate(target.getDate() + 15);

  const activeBatch = getActiveBatchForDate(target);
  const result = evaluateBookingWindow({ targetDate: target, userBatch: activeBatch, now });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'DESIGNATED_LIMIT_EXCEEDED');
});

test('non-batch users cannot book before 3 PM', () => {
  const now = new Date(2026, 2, 2, 14, 30, 0);
  const nextWorkingDay = new Date(now);
  nextWorkingDay.setDate(nextWorkingDay.getDate() + 1);

  const activeBatch = getActiveBatchForDate(nextWorkingDay);
  const userBatch = activeBatch === 1 ? 2 : 1;

  const result = evaluateBookingWindow({ targetDate: nextWorkingDay, userBatch, now });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'FLOATING_OPENS_3PM');
});

test('non-batch users can only book next working day after 3 PM', () => {
  const now = new Date(2026, 2, 6, 15, 30, 0); // Friday 3:30 PM
  const monday = parseDateOnly('2026-03-09');
  const tuesday = parseDateOnly('2026-03-10');

  const mondayActiveBatch = getActiveBatchForDate(monday);
  const userBatch = mondayActiveBatch === 1 ? 2 : 1;

  const mondayResult = evaluateBookingWindow({ targetDate: monday, userBatch, now });
  const tuesdayResult = evaluateBookingWindow({ targetDate: tuesday, userBatch, now });

  assert.equal(formatDateKey(mondayResult.nextWorkingDay), '2026-03-09');
  assert.equal(mondayResult.ok, true);
  assert.equal(tuesdayResult.ok, false);
  assert.equal(tuesdayResult.code, 'FLOATING_NEXT_WORKING_DAY_ONLY');
});

test('weekend is blocked', () => {
  const now = new Date(2026, 2, 2, 16, 0, 0);
  const saturday = parseDateOnly('2026-03-07');
  const activeBatch = 1;

  const result = evaluateBookingWindow({ targetDate: saturday, userBatch: activeBatch, now });

  assert.equal(result.ok, false);
  assert.equal(result.code, 'WEEKEND_BLOCKED');
});
