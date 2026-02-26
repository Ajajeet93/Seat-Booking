export const BookingModal = ({ seat, dateLabel, onClose, onConfirm }) => {
  if (!seat) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card">
        <h3 className="text-lg font-semibold text-slate-900">Confirm Seat Booking</h3>
        <p className="mt-1 text-sm text-slate-500">Review your seat details before confirming.</p>

        <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Seat Number</span>
            <span className="font-semibold text-slate-900">{seat.seatNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Seat Type</span>
            <span className="font-semibold text-slate-900">{seat.type}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Booking Date</span>
            <span className="font-semibold text-slate-900">{dateLabel}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
