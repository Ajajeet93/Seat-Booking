import {
  formatDateKey,
  getActiveBatchForDay,
  getNextWorkingDay,
  isWeekend,
} from './date'

export const getBookingPolicy = (date, userBatch) => {
  const weekend = isWeekend(date)
  const activeBatch = getActiveBatchForDay(date)
  const isBatchDay = activeBatch === userBatch
  const after3PM = date.getHours() >= 15

  if (weekend) {
    return {
      allowDesignated: false,
      allowFloating: false,
      allowToday: false,
      targetDate: null,
      reason: 'Office is closed on weekends.',
      activeBatch,
      isBatchDay,
      after3PM,
    }
  }

  if (isBatchDay) {
    return {
      allowDesignated: true,
      allowFloating: true,
      allowToday: true,
      targetDate: date,
      reason: null,
      activeBatch,
      isBatchDay,
      after3PM,
    }
  }

  if (!after3PM) {
    return {
      allowDesignated: false,
      allowFloating: false,
      allowToday: false,
      targetDate: getNextWorkingDay(date),
      reason: 'Floating booking opens after 3:00 PM on non-batch days.',
      activeBatch,
      isBatchDay,
      after3PM,
    }
  }

  return {
    allowDesignated: false,
    allowFloating: true,
    allowToday: false,
    targetDate: getNextWorkingDay(date),
    reason: null,
    activeBatch,
    isBatchDay,
    after3PM,
  }
}

export const canBookSeat = ({ seat, seatStatus, policy, hasUserBooking }) => {
  if (hasUserBooking) {
    return { allowed: false, reason: 'You can book only one seat.' }
  }

  if (seatStatus === 'booked' || seatStatus === 'your-seat') {
    return { allowed: false, reason: 'Seat is already booked.' }
  }

  if (!policy.targetDate) {
    return { allowed: false, reason: policy.reason }
  }

  if (seatStatus === 'released') {
    if (!policy.allowFloating) {
      return { allowed: false, reason: policy.reason || 'Floating rules are not met.' }
    }
    return { allowed: true, reason: null }
  }

  if (seat.type === 'Designated' && !policy.allowDesignated) {
    return {
      allowed: false,
      reason:
        policy.reason ||
        'Designated seats are available only when your batch is active.',
    }
  }

  if (seat.type === 'Floating' && !policy.allowFloating) {
    return {
      allowed: false,
      reason: policy.reason || 'Floating seats are currently unavailable.',
    }
  }

  return { allowed: true, reason: null }
}

export const getUserBooking = (bookingsByDate, userId) => {
  for (const [dateKey, bookings] of Object.entries(bookingsByDate)) {
    const booking = bookings.find((item) => item.userId === userId)
    if (booking) {
      return { ...booking, dateKey }
    }
  }

  return null
}

export const upsertBooking = ({ bookingsByDate, date, booking }) => {
  const key = formatDateKey(date)
  const current = bookingsByDate[key] || []

  return {
    ...bookingsByDate,
    [key]: [...current, booking],
  }
}
