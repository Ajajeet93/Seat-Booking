const statusStyles = {
  available: 'bg-slate-100 text-slate-700 border-slate-200',
  booked: 'bg-red-100 text-red-700 border-red-200',
  'your-seat': 'bg-blue-100 text-blue-700 border-blue-200',
  floating: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  released: 'bg-green-100 text-green-700 border-green-200',
}

const statusLabels = {
  available: 'Available',
  booked: 'Booked',
  'your-seat': 'Your Seat',
  floating: 'Floating',
  released: 'Released',
}

export const SeatCard = ({ seat, status, canBook, onBook, reason }) => {
  const isDisabled = !canBook

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card ${statusStyles[status]}`}
      title={reason || ''}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">{seat.seatNumber}</p>
        <span className="rounded-full border border-current px-2 py-0.5 text-xs font-medium">
          {statusLabels[status]}
        </span>
      </div>

      <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
        {status === 'released' ? 'Floating (Released)' : seat.type}
      </p>

      <button
        type="button"
        onClick={onBook}
        disabled={isDisabled}
        className="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Book Seat
      </button>
    </div>
  )
}
