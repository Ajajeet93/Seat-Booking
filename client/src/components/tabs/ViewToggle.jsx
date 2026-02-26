export const ViewToggle = ({ view, onChange }) => (
  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
    <button
      type="button"
      onClick={() => onChange('today')}
      className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
        view === 'today' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      Today View
    </button>
    <button
      type="button"
      onClick={() => onChange('weekly')}
      className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
        view === 'weekly' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      Weekly View
    </button>
  </div>
)
