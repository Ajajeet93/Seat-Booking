const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const parseDateOnly = (value) => {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const getIsoWeekNumber = (date) => {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil((((utcDate - yearStart) / MS_PER_DAY) + 1) / 7);
};

const getActiveBatchForDate = (date) => {
  if (isWeekend(date)) {
    return null;
  }

  const weekNumber = getIsoWeekNumber(date);
  const day = date.getDay();
  const isMonToWed = day >= 1 && day <= 3;

  if (weekNumber % 2 === 1) {
    return isMonToWed ? 1 : 2;
  }

  return isMonToWed ? 2 : 1;
};

const getNextWorkingDay = (baseDate = new Date()) => {
  const nextDay = startOfDay(baseDate);
  nextDay.setDate(nextDay.getDate() + 1);

  while (isWeekend(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
};

const getDiffInDays = (targetDate, fromDate) => {
  const target = startOfDay(targetDate).getTime();
  const from = startOfDay(fromDate).getTime();
  return Math.floor((target - from) / MS_PER_DAY);
};

const getRotationForDate = (date) => {
  const weekNumber = getIsoWeekNumber(date);
  return {
    date: formatDateKey(date),
    weekNumber,
    dayOfWeek: date.getDay(),
    dayLabel: DAY_LABELS[date.getDay()],
    activeBatch: getActiveBatchForDate(date),
  };
};

const evaluateBookingWindow = ({ targetDate, userBatch, now = new Date() }) => {
  const today = startOfDay(now);
  const nextWorkingDay = getNextWorkingDay(now);
  const activeBatch = getActiveBatchForDate(targetDate);
  const isBatchDay = activeBatch === userBatch;
  const after3PM = now.getHours() >= 15;
  const diffInDays = getDiffInDays(targetDate, today);

  if (targetDate < today) {
    return {
      ok: false,
      code: "PAST_DATE",
      message: "Past date booking is not allowed.",
      activeBatch,
      isBatchDay,
      nextWorkingDay,
      diffInDays,
      after3PM,
    };
  }

  if (isWeekend(targetDate)) {
    return {
      ok: false,
      code: "WEEKEND_BLOCKED",
      message: "Weekend booking is not allowed.",
      activeBatch,
      isBatchDay,
      nextWorkingDay,
      diffInDays,
      after3PM,
    };
  }

  if (isBatchDay) {
    if (diffInDays > 14) {
      return {
        ok: false,
        code: "DESIGNATED_LIMIT_EXCEEDED",
        message: "Designated seats can be booked only up to 14 days in advance.",
        activeBatch,
        isBatchDay,
        nextWorkingDay,
        diffInDays,
        after3PM,
      };
    }

    return {
      ok: true,
      code: "BATCH_DAY",
      message: "Your batch is active. You can book designated seats.",
      activeBatch,
      isBatchDay,
      nextWorkingDay,
      diffInDays,
      after3PM,
    };
  }

  if (!after3PM) {
    return {
      ok: false,
      code: "FLOATING_OPENS_3PM",
      message: "Floating seats for non-batch users open after 3:00 PM.",
      activeBatch,
      isBatchDay,
      nextWorkingDay,
      diffInDays,
      after3PM,
    };
  }

  const targetDateKey = formatDateKey(targetDate);
  const nextWorkingDayKey = formatDateKey(nextWorkingDay);

  if (targetDateKey !== nextWorkingDayKey) {
    return {
      ok: false,
      code: "FLOATING_NEXT_WORKING_DAY_ONLY",
      message: "On non-batch days, floating seats can only be booked for the next working day.",
      activeBatch,
      isBatchDay,
      nextWorkingDay,
      diffInDays,
      after3PM,
    };
  }

  return {
    ok: true,
    code: "NON_BATCH_DAY",
    message: "Non-batch booking window open for next working day floating seats.",
    activeBatch,
    isBatchDay,
    nextWorkingDay,
    diffInDays,
    after3PM,
  };
};

module.exports = {
  DAY_LABELS,
  parseDateOnly,
  formatDateKey,
  isWeekend,
  getIsoWeekNumber,
  getActiveBatchForDate,
  getNextWorkingDay,
  getRotationForDate,
  evaluateBookingWindow,
};
