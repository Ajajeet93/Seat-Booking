const toastTone = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
}

export const ToastContainer = ({ toasts }) => (
  <div className="pointer-events-none fixed bottom-4 right-4 z-50 space-y-2">
    {toasts.map((toast) => (
      <div
        key={toast.id}
        className={`rounded-lg border px-4 py-2 text-sm font-medium shadow-card ${toastTone[toast.type]}`}
      >
        {toast.message}
      </div>
    ))}
  </div>
)
