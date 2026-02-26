const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const formatDateKey = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const formatDisplayDate = (date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

export const getWeekdayLabel = (date) => WEEKDAY_LABELS[date.getDay()]

export const isWeekend = (date) => {
  const day = date.getDay()
  return day === 0 || day === 6
}

export const getMonday = (date) => {
  const target = new Date(date)
  const day = target.getDay()
  const diff = day === 0 ? -6 : 1 - day
  target.setDate(target.getDate() + diff)
  target.setHours(0, 0, 0, 0)
  return target
}

export const getWorkingDaysInWeek = (date) => {
  const monday = getMonday(date)
  return Array.from({ length: 5 }, (_, index) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + index)
    return d
  })
}

export const getNextWorkingDay = (date) => {
  const next = new Date(date)
  next.setDate(next.getDate() + 1)

  while (isWeekend(next)) {
    next.setDate(next.getDate() + 1)
  }

  return next
}

export const getWeekRotation = (date) => {
  const anchorMonday = new Date(2026, 0, 5)
  const currentMonday = getMonday(date)
  const diffInDays = Math.floor((currentMonday - anchorMonday) / (1000 * 60 * 60 * 24))
  const weekNumber = Math.floor(diffInDays / 7)

  return weekNumber % 2 === 0 ? 'Week 1' : 'Week 2'
}

export const getActiveBatchForDay = (date) => {
  if (isWeekend(date)) {
    return null
  }

  const week = getWeekRotation(date)
  const day = date.getDay()
  const isMonToWed = day >= 1 && day <= 3

  if (week === 'Week 1') {
    return isMonToWed ? 'Batch 1' : 'Batch 2'
  }

  return isMonToWed ? 'Batch 2' : 'Batch 1'
}
