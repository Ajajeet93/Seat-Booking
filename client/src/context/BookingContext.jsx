import { createContext, useMemo, useState } from 'react'
import {
  ORG,
  RELEASED_SEATS,
  SAMPLE_BOOKINGS,
  SEATS,
  USER,
} from '../data/mockData'
import {
  formatDateKey,
  formatDisplayDate,
  getWorkingDaysInWeek,
  getWeekdayLabel,
} from '../utils/date'
import {
  canBookSeat,
  getBookingPolicy,
  getUserBooking,
  upsertBooking,
} from '../utils/bookingRules'

export const BookingContext = createContext(null)

export const BookingProvider = ({ children }) => {
  const [currentDate] = useState(() => new Date())
  const [bookingsByDate, setBookingsByDate] = useState(() => {
    const todayKey = formatDateKey(currentDate)
    return {
      [todayKey]: SAMPLE_BOOKINGS,
    }
  })
  const [toasts, setToasts] = useState([])

  const policy = useMemo(
    () => getBookingPolicy(currentDate, USER.batch),
    [currentDate],
  )

  const userBooking = useMemo(
    () => getUserBooking(bookingsByDate, USER.id),
    [bookingsByDate],
  )

  const hasUserBooking = Boolean(userBooking)

  const weeklyDates = useMemo(() => getWorkingDaysInWeek(currentDate), [currentDate])

  const getBookingsForDate = (date) => {
    const key = formatDateKey(date)
    return bookingsByDate[key] || []
  }

  const getSeatStatus = (seat, date = currentDate) => {
    const bookings = getBookingsForDate(date)
    const booking = bookings.find((item) => item.seatId === seat.id)

    if (booking?.userId === USER.id) {
      return 'your-seat'
    }

    if (booking) {
      return 'booked'
    }

    if (RELEASED_SEATS.includes(seat.id)) {
      return 'released'
    }

    if (seat.type === 'Floating') {
      return 'floating'
    }

    return 'available'
  }

  const getSeatAction = (seat) => {
    const seatStatus = getSeatStatus(seat)
    return canBookSeat({ seat, seatStatus, policy, hasUserBooking })
  }

  const addToast = (type, message) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id))
    }, 3000)
  }

  const bookSeat = (seat) => {
    const action = getSeatAction(seat)

    if (!action.allowed) {
      addToast('error', action.reason)
      return { success: false, reason: action.reason }
    }

    const targetDate = policy.targetDate
    const nextState = upsertBooking({
      bookingsByDate,
      date: targetDate,
      booking: {
        seatId: seat.id,
        userId: USER.id,
        userName: USER.name,
        batch: USER.batch,
      },
    })

    setBookingsByDate(nextState)
    addToast(
      'success',
      `Seat ${seat.seatNumber} booked for ${formatDisplayDate(targetDate)}.`,
    )

    return { success: true }
  }

  const todayBookings = getBookingsForDate(currentDate)
  const availableToday = SEATS.filter((seat) => getSeatStatus(seat) !== 'booked' && getSeatStatus(seat) !== 'your-seat').length
  const floatingAvailable = SEATS.filter((seat) => {
    const status = getSeatStatus(seat)
    return status === 'floating' || status === 'released'
  }).length

  const weeklyAllocation = weeklyDates.map((date) => {
    const dateKey = formatDateKey(date)
    const bookings = getBookingsForDate(date)

    return {
      date,
      dateKey,
      label: getWeekdayLabel(date),
      bookings,
      activeBatch: getBookingPolicy(date, USER.batch).activeBatch,
    }
  })

  const value = {
    user: USER,
    organization: ORG,
    seats: SEATS,
    currentDate,
    policy,
    userBooking,
    hasUserBooking,
    getSeatStatus,
    getSeatAction,
    bookSeat,
    toasts,
    stats: {
      totalSeats: ORG.seats,
      availableToday,
      floatingAvailable,
      todayBookings: todayBookings.length,
    },
    weeklyAllocation,
  }

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}
