import { StatCard } from './StatCard'

export const StatsGrid = ({ stats, userBooking }) => {
  const bookingValue = userBooking ? 'Booked' : 'Not Booked'
  const bookingHelper = userBooking
    ? `Seat ${userBooking.seatId} | ${userBooking.dateKey}`
    : 'No active booking'

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Seats"
        value={stats.totalSeats}
        helper="Designated + Floating"
      />
      <StatCard
        label="Available Seats Today"
        value={stats.availableToday}
        helper="Based on today occupancy"
      />
      <StatCard
        label="Floating Seats Available"
        value={stats.floatingAvailable}
        helper="Floating + released"
      />
      <StatCard
        label="Your Booking Status"
        value={bookingValue}
        helper={bookingHelper}
      />
    </section>
  )
}
