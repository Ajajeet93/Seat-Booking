const express = require("express");
const pool = require("../db");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  parseDateOnly,
  formatDateKey,
  getRotationForDate,
  evaluateBookingWindow,
} = require("../services/bookingPolicy");

const router = express.Router();

const getFloatingPoolStats = async (dbClient, dateKey) => {
  const [baseFloatingResult, releasedDesignatedResult] = await Promise.all([
    dbClient.query("SELECT COUNT(*)::int AS count FROM seats WHERE seat_type = 'FLOATING'"),
    dbClient.query(
      "SELECT COUNT(DISTINCT b.seat_id)::int AS count FROM bookings b JOIN seats s ON s.id = b.seat_id WHERE b.booking_date = $1 AND b.status = 'RELEASED' AND s.seat_type = 'DESIGNATED'",
      [dateKey],
    ),
  ]);

  const baseFloating = baseFloatingResult.rows[0].count;
  const releasedDesignated = releasedDesignatedResult.rows[0].count;

  return {
    baseFloating,
    releasedDesignated,
    effectiveFloating: baseFloating + releasedDesignated,
  };
};

const buildWindowMeta = (windowResult) => ({
  code: windowResult.code,
  message: windowResult.message,
  canBookNow: windowResult.ok,
  activeBatch: windowResult.activeBatch,
  isBatchDay: windowResult.isBatchDay,
  after3PM: windowResult.after3PM,
  nextWorkingDay: formatDateKey(windowResult.nextWorkingDay),
  daysAhead: windowResult.diffInDays,
});

router.get("/rotation", authMiddleware, async (req, res) => {
  const dateInput = req.query.date || formatDateKey(new Date());
  const date = parseDateOnly(dateInput);

  if (!date) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
  }

  return res.json(getRotationForDate(date));
});

router.get("/floating-stats", authMiddleware, async (req, res) => {
  try {
    const targetDate = req.query.date ? parseDateOnly(req.query.date) : parseDateOnly(formatDateKey(new Date()));

    if (!targetDate) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    const dateKey = formatDateKey(targetDate);
    const floatingPool = await getFloatingPoolStats(pool, dateKey);

    return res.json({
      date: dateKey,
      floatingPool,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error while fetching floating stats." });
  }
});

router.get("/seats", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ error: "Date is required." });
    }

    const targetDate = parseDateOnly(date);
    if (!targetDate) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    const userBatch = Number(req.user.batch);
    const dateKey = formatDateKey(targetDate);
    const windowResult = evaluateBookingWindow({
      targetDate,
      userBatch,
      now: new Date(),
    });

    if (!windowResult.ok && (windowResult.code === "PAST_DATE" || windowResult.code === "WEEKEND_BLOCKED")) {
      return res.status(400).json({ error: windowResult.message });
    }

    const [
      allSeatsResult,
      bookedResult,
      releasedResult,
      userBookingResult,
      floatingPool,
    ] = await Promise.all([
      pool.query("SELECT id, seat_number, seat_type, assigned_batch FROM seats ORDER BY seat_number ASC"),
      pool.query("SELECT seat_id, employee_id FROM bookings WHERE booking_date = $1 AND status = 'BOOKED'", [dateKey]),
      pool.query("SELECT seat_id FROM bookings WHERE booking_date = $1 AND status = 'RELEASED'", [dateKey]),
      pool.query("SELECT seat_id, status FROM bookings WHERE employee_id = $1 AND booking_date = $2 LIMIT 1", [req.user.id, dateKey]),
      getFloatingPoolStats(pool, dateKey),
    ]);

    const allSeats = allSeatsResult.rows;
    const bookedRows = bookedResult.rows;
    const releasedRows = releasedResult.rows;

    const bookedBySeatId = new Map(bookedRows.map((row) => [row.seat_id, row]));
    const releasedSeatIds = new Set(releasedRows.map((row) => row.seat_id));

    const userBooking = userBookingResult.rows[0] || null;
    const hasUserBooking = Boolean(userBooking && userBooking.status === "BOOKED");
    const userBookedSeatId = userBooking && userBooking.status === "BOOKED" ? userBooking.seat_id : null;

    const visibleSeatMap = new Map();

    for (const seat of allSeats) {
      const isReleased = releasedSeatIds.has(seat.id);
      const isVisible = windowResult.isBatchDay
        ? seat.seat_type === "DESIGNATED" && !isReleased
        : seat.seat_type === "FLOATING" || isReleased;

      if (isVisible) {
        visibleSeatMap.set(seat.id, seat);
      }
    }

    if (userBookedSeatId && !visibleSeatMap.has(userBookedSeatId)) {
      const userSeat = allSeats.find((seat) => seat.id === userBookedSeatId);
      if (userSeat) {
        visibleSeatMap.set(userSeat.id, userSeat);
      }
    }

    const seats = Array.from(visibleSeatMap.values())
      .sort((a, b) => a.seat_number - b.seat_number)
      .map((seat) => {
        const bookedRow = bookedBySeatId.get(seat.id);
        const isBooked = Boolean(bookedRow);
        const isReleased = releasedSeatIds.has(seat.id);
        const isMyBooking = Boolean(bookedRow && bookedRow.employee_id === req.user.id);

        let status = "AVAILABLE";
        if (isBooked) {
          status = "BOOKED";
        } else if (isReleased) {
          status = "RELEASED";
        } else if (seat.seat_type === "FLOATING") {
          status = "FLOATING";
        }

        let isBookable = false;

        if (!isBooked && !hasUserBooking && windowResult.ok) {
          if (windowResult.isBatchDay) {
            isBookable =
              seat.seat_type === "DESIGNATED" &&
              !isReleased;
          } else {
            isBookable = seat.seat_type === "FLOATING" || isReleased;
          }
        }

        return {
          ...seat,
          status,
          isMyBooking,
          isBookable,
        };
      });

    return res.json({
      date: dateKey,
      rotation: getRotationForDate(targetDate),
      bookingWindow: buildWindowMeta(windowResult),
      floatingPool,
      seats,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error." });
  }
});

router.post("/book-seat", authMiddleware, async (req, res) => {
  const client = await pool.connect();

  try {
    const { date, seat_id } = req.body;

    const targetDate = parseDateOnly(date);
    if (!targetDate) {
      return res.status(400).json({ error: "Invalid booking date. Use YYYY-MM-DD." });
    }

    const seatId = Number(seat_id);
    if (!Number.isInteger(seatId) || seatId <= 0) {
      return res.status(400).json({ error: "Invalid seat_id." });
    }

    const userBatch = Number(req.user.batch);
    const dateKey = formatDateKey(targetDate);

    const windowResult = evaluateBookingWindow({
      targetDate,
      userBatch,
      now: new Date(),
    });

    if (!windowResult.ok) {
      return res.status(400).json({ error: windowResult.message });
    }

    await client.query("BEGIN");

    const seatResult = await client.query(
      "SELECT id, seat_number, seat_type, assigned_batch FROM seats WHERE id = $1 FOR UPDATE",
      [seatId],
    );

    if (seatResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Seat not found." });
    }

    const seat = seatResult.rows[0];

    const existingUserBooking = await client.query(
      "SELECT id FROM bookings WHERE employee_id = $1 AND booking_date = $2 LIMIT 1",
      [req.user.id, dateKey],
    );

    if (existingUserBooking.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "You can book only one seat per day." });
    }

    const existingSeatBooking = await client.query(
      "SELECT id FROM bookings WHERE seat_id = $1 AND booking_date = $2 AND status = 'BOOKED' FOR UPDATE",
      [seatId, dateKey],
    );

    if (existingSeatBooking.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Seat is already booked for this date." });
    }

    const releasedSeatResult = await client.query(
      "SELECT id FROM bookings WHERE seat_id = $1 AND booking_date = $2 AND status = 'RELEASED' LIMIT 1",
      [seatId, dateKey],
    );

    const isReleasedSeat = releasedSeatResult.rows.length > 0;

    if (windowResult.isBatchDay) {
      const isAllowedDesignatedSeat =
        seat.seat_type === "DESIGNATED" &&
        !isReleasedSeat;

      if (!isAllowedDesignatedSeat) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "On your batch day, only designated seats are allowed.",
        });
      }
    } else {
      const isFloatingCandidate = seat.seat_type === "FLOATING" || isReleasedSeat;
      if (!isFloatingCandidate) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          error: "On non-batch days, only floating or released seats can be booked.",
        });
      }
    }

    await client.query(
      "INSERT INTO bookings (employee_id, seat_id, booking_date, status) VALUES ($1, $2, $3, 'BOOKED')",
      [req.user.id, seatId, dateKey],
    );

    await client.query("COMMIT");

    return res.json({
      message: "Seat booked successfully.",
      booking: {
        seat_id: seatId,
        seat_number: seat.seat_number,
        booking_date: dateKey,
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");

    if (err.code === "23505") {
      return res.status(409).json({ error: "Booking conflict detected. Try another seat/date." });
    }

    console.error(err);
    return res.status(500).json({ error: "Server error during booking." });
  } finally {
    client.release();
  }
});

router.post("/release-seat", authMiddleware, async (req, res) => {
  try {
    const { date, seat_id } = req.body;

    const targetDate = parseDateOnly(date);
    if (!targetDate) {
      return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
    }

    const seatId = Number(seat_id);
    if (!Number.isInteger(seatId) || seatId <= 0) {
      return res.status(400).json({ error: "Invalid seat_id." });
    }

    const dateKey = formatDateKey(targetDate);

    const updateResult = await pool.query(
      "UPDATE bookings SET status = 'RELEASED' WHERE employee_id = $1 AND seat_id = $2 AND booking_date = $3 AND status = 'BOOKED' RETURNING *",
      [req.user.id, seatId, dateKey],
    );

    if (updateResult.rows.length === 0) {
      return res.status(400).json({ error: "No active booking found to release." });
    }

    const floatingPool = await getFloatingPoolStats(pool, dateKey);

    return res.json({
      message: "Seat released. It is now available in floating pool.",
      floatingPool,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error during release." });
  }
});

router.get("/weekly-view", authMiddleware, async (req, res) => {
  try {
    const { startDate } = req.query;
    const start = parseDateOnly(startDate);

    if (!start) {
      return res.status(400).json({ error: "Invalid startDate format. Use YYYY-MM-DD." });
    }

    const end = new Date(start);
    end.setDate(end.getDate() + 4);

    const query =
      "SELECT b.booking_date, b.status, s.seat_number, s.id as seat_id, e.id as employee_id, e.name as employee_name " +
      "FROM bookings b " +
      "JOIN seats s ON b.seat_id = s.id " +
      "JOIN employees e ON b.employee_id = e.id " +
      "WHERE b.booking_date >= $1 AND b.booking_date <= $2 " +
      "ORDER BY b.booking_date ASC, s.seat_number ASC";

    const result = await pool.query(query, [formatDateKey(start), formatDateKey(end)]);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error." });
  }
});

router.get("/my-bookings", authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    let query =
      "SELECT b.id as booking_id, b.booking_date, b.status, s.seat_number, s.id as seat_id " +
      "FROM bookings b " +
      "JOIN seats s ON b.seat_id = s.id " +
      "WHERE b.employee_id = $1";

    const queryParams = [req.user.id];

    if (date) {
      const parsedDate = parseDateOnly(date);
      if (!parsedDate) {
        return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
      }

      query += " AND b.booking_date = $2";
      queryParams.push(formatDateKey(parsedDate));
    } else {
      query += " AND b.booking_date >= CURRENT_DATE";
    }

    query += " ORDER BY b.booking_date ASC";

    const result = await pool.query(query, queryParams);
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error fetching user bookings." });
  }
});

module.exports = router;
