import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDatePretty = (dateKey) => {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const WeeklyView = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(getLocalDateKey());
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, [startDate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/my-two-week-schedule?startDate=${startDate}`);
      setSchedule(res.data?.schedule || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load 2-week schedule');
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  };

  const bookedCount = useMemo(
    () => schedule.filter((item) => item.booking && item.booking.status === 'BOOKED').length,
    [schedule],
  );

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
            My 2-Week Seat Schedule
          </h1>
          <p className="text-gray-300 mt-2">
            Track your next 10 working days and choose seats where missing.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-2 rounded-xl border border-white/20">
          <span className="text-gray-200 text-sm">Start date:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-black/20 text-white border border-white/10 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="card p-4 border-white/20">
          <p className="text-xs uppercase tracking-wider text-gray-300">Working Days</p>
          <p className="text-2xl font-bold text-white mt-1">{schedule.length}</p>
        </div>
        <div className="card p-4 border-white/20">
          <p className="text-xs uppercase tracking-wider text-gray-300">Seats Chosen</p>
          <p className="text-2xl font-bold text-white mt-1">{bookedCount}</p>
        </div>
        <div className="card p-4 border-white/20">
          <p className="text-xs uppercase tracking-wider text-gray-300">Pending Selection</p>
          <p className="text-2xl font-bold text-white mt-1">{Math.max(0, schedule.length - bookedCount)}</p>
        </div>
      </div>

      <div className="card overflow-x-auto border-white/20">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/10">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Active Batch</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Your Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Seat</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center text-gray-200">Loading schedule...</td>
              </tr>
            ) : schedule.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-10 text-center text-gray-300">No schedule data found.</td>
              </tr>
            ) : (
              schedule.map((item) => (
                <tr key={item.date} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-100">
                    <div className="font-semibold">{formatDatePretty(item.date)}</div>
                    <div className="text-xs text-gray-400">{item.date}</div>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-200">
                    {item.activeBatch ? `Batch ${item.activeBatch}` : 'Weekend'}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {item.booking ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                        Chosen
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30">
                        Not Chosen
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-200">
                    {item.booking ? `Seat ${item.booking.seat_number}` : '-'}
                  </td>

                  <td className="px-4 py-3 text-sm">
                    {item.booking ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/book?date=${item.date}`)}
                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-white/10 text-gray-200 border border-white/20 hover:bg-white/20"
                      >
                        View
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/book?date=${item.date}`)}
                        disabled={!item.canChooseSeat}
                        title={item.canChooseSeat ? 'Choose seat' : item.chooseReason || 'Booking not allowed now'}
                        className="px-3 py-1.5 text-xs font-bold rounded-md bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Choose Seat
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WeeklyView;
