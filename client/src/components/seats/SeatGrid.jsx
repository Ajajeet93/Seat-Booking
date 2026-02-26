import { SeatCard } from './SeatCard'

export const SeatGrid = ({ seats, getSeatStatus, getSeatAction, onSelectSeat }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:p-6">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">Seat Layout</h2>
      <p className="text-sm text-slate-500">50 Seats | 10 x 5 Grid</p>
    </div>

    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10">
      {seats.map((seat) => {
        const status = getSeatStatus(seat)
        const action = getSeatAction(seat)

        return (
          <SeatCard
            key={seat.id}
            seat={seat}
            status={status}
            canBook={action.allowed}
            reason={action.reason}
            onBook={() => onSelectSeat(seat)}
          />
        )
      })}
    </div>
  </section>
)
