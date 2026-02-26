import { formatDisplayDate } from '../../utils/date'

export const WeeklyView = ({ allocation, userId }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
    <div className="border-b border-slate-200 px-4 py-4 sm:px-6">
      <h2 className="text-lg font-semibold text-slate-900">Week-wise Allocation</h2>
      <p className="text-sm text-slate-500">Monday to Friday booking overview</p>
    </div>

    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Day
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Active Batch
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Bookings
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Your Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {allocation.map((item) => {
            const yourBooking = item.bookings.find((booking) => booking.userId === userId)

            return (
              <tr key={item.dateKey}>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.label}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{formatDisplayDate(item.date)}</td>
                <td className="px-4 py-3 text-sm text-slate-700">{item.activeBatch || '-'}</td>
                <td className="px-4 py-3 text-sm text-slate-700">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    {item.bookings.length} booked
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {yourBooking ? (
                    <span className="inline-flex items-center gap-2 font-medium text-blue-700">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                      Seat {yourBooking.seatId}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      No booking
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  </section>
)
