const toneMap = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
}

export const Banner = ({ type = 'info', text }) => (
  <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${toneMap[type]}`}>
    {text}
  </div>
)
