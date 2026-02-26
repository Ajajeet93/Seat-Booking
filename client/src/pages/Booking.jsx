import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Armchair, CheckCircle2, Lock, Unlock, Wind, UserCheck } from 'lucide-react';

const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const isDateKey = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const SeatCard = ({ seat, onBook, onRelease }) => {
  let bgClass = 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200 hover:bg-emerald-500/20 hover:-translate-y-1 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30 backdrop-blur-md';
  let statusText = 'Available';
  let Icon = CheckCircle2;
  let iconColor = 'text-emerald-400';

  if (seat.status === 'FLOATING') {
    bgClass = 'bg-yellow-500/20 border-yellow-400/40 text-yellow-200 hover:bg-yellow-500/30 hover:-translate-y-1 shadow-md shadow-yellow-500/20 ring-1 ring-yellow-500/30 backdrop-blur-md';
    statusText = 'Floating';
    Icon = Wind;
    iconColor = 'text-yellow-300';
  }

  if (seat.status === 'BOOKED') {
    if (seat.isMyBooking) {
      bgClass = 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-xl shadow-cyan-500/20 ring-1 ring-cyan-400/50 backdrop-blur-md';
      statusText = 'Your Seat';
      Icon = UserCheck;
      iconColor = 'text-cyan-200';
    } else {
      bgClass = 'bg-red-500/20 border-red-500/30 text-red-200 cursor-not-allowed opacity-80 backdrop-blur-sm';
      statusText = 'Booked';
      Icon = Lock;
      iconColor = 'text-red-400';
    }
  } else if (seat.status === 'RELEASED') {
    bgClass = 'bg-amber-500/20 border-amber-400/50 text-amber-200 hover:bg-amber-500/30 hover:-translate-y-1 shadow-md shadow-amber-500/20 ring-1 ring-amber-500/30 backdrop-blur-md';
    statusText = 'Released';
    Icon = Unlock;
    iconColor = 'text-amber-400';
  }

  return (
    <div className={`relative flex flex-col items-center justify-between p-5 rounded-2xl border transition-all duration-300 ${bgClass} h-full min-h-[140px]`}>
      <div className="absolute top-3 right-3">
        <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col items-center mt-2">
        <Armchair className={`w-8 h-8 mb-2 ${iconColor} opacity-80`} />
        <span className="text-xl font-extrabold tracking-tight">Seat {seat.seat_number}</span>
        <span className={`text-xs mt-1 font-semibold tracking-wider uppercase ${iconColor}`}>{statusText}</span>
      </div>
      <div className="mt-4 w-full">
        {statusText === 'Your Seat' && (
          <button onClick={() => onRelease(seat.id)} className="w-full py-2 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center">
            Release
          </button>
        )}
        {(statusText === 'Available' || statusText === 'Floating' || statusText === 'Released') && seat.status !== 'BOOKED' && seat.isBookable && (
          <button onClick={() => onBook(seat.id)} className="w-full py-2 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors flex items-center justify-center">
            Book Seat
          </button>
        )}
      </div>
    </div>
  );
};

const Booking = () => {
  const [searchParams] = useSearchParams();
  const queryDate = searchParams.get('date');
  const [date, setDate] = useState(isDateKey(queryDate || '') ? queryDate : getLocalDateKey());
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [meta, setMeta] = useState({
    bookingWindow: null,
    floatingPool: null,
    rotation: null,
  });

  useEffect(() => {
    fetchSeats();
  }, [date]);

  useEffect(() => {
    if (isDateKey(queryDate || '')) {
      setDate(queryDate);
    }
  }, [queryDate]);

  const fetchSeats = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/seats?date=${date}`);
      const payload = res.data || {};
      const apiSeats = Array.isArray(payload) ? payload : payload.seats || [];

      setSeats(apiSeats);
      setMeta({
        bookingWindow: payload.bookingWindow || null,
        floatingPool: payload.floatingPool || null,
        rotation: payload.rotation || null,
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load seats');
      setSeats([]);
      setMeta({ bookingWindow: null, floatingPool: null, rotation: null });
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (seatId) => {
    try {
      await api.post('/book-seat', { date, seat_id: seatId });
      toast.success('Seat booked successfully!');
      fetchSeats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    }
  };

  const handleRelease = async (seatId) => {
    try {
      await api.post('/release-seat', { date, seat_id: seatId });
      toast.success('Seat released.');
      fetchSeats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Release failed');
    }
  };

  const filteredSeats = seats.filter((seat) => {
    if (filter === 'ALL') return true;
    if (filter === 'AVAILABLE') return seat.status !== 'BOOKED';
    if (filter === 'BOOKED') return seat.status === 'BOOKED';
    return true;
  });

  const myBookedSeat = seats.find((seat) => seat.isMyBooking && seat.status === 'BOOKED') || null;

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">Seat Booking</h1>
          <p className="text-gray-300 mt-2 font-medium">Select your preferred space for the selected day.</p>
          {meta.bookingWindow && (
            <p className="text-sm text-cyan-200 mt-2">{meta.bookingWindow.message}</p>
          )}
        </div>
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-[0_4px_16px_0_rgba(0,0,0,0.2)] inline-flex">
          <input
            type="date"
            value={date}
            min={getLocalDateKey()}
            max={getLocalDateKey(new Date(new Date().setDate(new Date().getDate() + 14)))}
            onChange={(e) => setDate(e.target.value)}
            className="input-field max-w-xs border-none bg-transparent shadow-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-4 border-white/20">
          <p className="text-xs uppercase tracking-wider text-gray-300">Active Batch</p>
          <p className="text-xl font-bold text-white mt-1">{meta.rotation?.activeBatch ? `Batch ${meta.rotation.activeBatch}` : 'Weekend'}</p>
        </div>
        <div className="card p-4 border-white/20">
          <p className="text-xs uppercase tracking-wider text-gray-300">Floating Capacity</p>
          <p className="text-xl font-bold text-white mt-1">{meta.floatingPool?.effectiveFloating ?? 10}</p>
        </div>
        <div className="card p-4 border-white/20">
          <p className="text-xs uppercase tracking-wider text-gray-300">Policy Window</p>
          <p className="text-xl font-bold text-white mt-1">{meta.bookingWindow?.canBookNow ? 'Open' : 'Restricted'}</p>
        </div>
      </div>

      <div className="card p-4 border-white/20 mb-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Actions</p>
            <p className="text-xs text-gray-300">
              Book by selecting an available/floating/released seat card. Release your current seat with one click.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                const firstBookable = seats.find((seat) => seat.isBookable);
                if (!firstBookable) {
                  toast.error('No bookable seat available for this date.');
                  return;
                }
                handleBook(firstBookable.id);
              }}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors"
            >
              Quick Book
            </button>
            <button
              type="button"
              onClick={() => {
                if (!myBookedSeat) {
                  toast.error('No active seat to release for this date.');
                  return;
                }
                handleRelease(myBookedSeat.id);
              }}
              className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-red-500/20 hover:bg-red-500/40 border border-red-500/40 text-red-100 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!myBookedSeat}
            >
              Release My Seat
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-10 text-sm text-gray-200 card p-4 items-center justify-center border-white/20">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white mr-2">Filter:</span>
          <button onClick={() => setFilter('ALL')} className={`px-3 py-1 rounded-md transition-colors ${filter === 'ALL' ? 'bg-indigo-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Visible Seats</button>
          <button onClick={() => setFilter('AVAILABLE')} className={`px-3 py-1 rounded-md transition-colors ${filter === 'AVAILABLE' ? 'bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Available</button>
          <button onClick={() => setFilter('BOOKED')} className={`px-3 py-1 rounded-md transition-colors ${filter === 'BOOKED' ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20'}`}>Booked</button>
        </div>
        <div className="w-px h-6 bg-white/20 mx-2 hidden md:block"></div>
        <div className="flex items-center"><div className="w-4 h-4 bg-emerald-500/40 border border-emerald-400/50 mr-2 rounded"></div> Available</div>
        <div className="flex items-center"><div className="w-4 h-4 bg-yellow-500/40 border border-yellow-400/50 mr-2 rounded"></div> Floating</div>
        <div className="flex items-center"><div className="w-4 h-4 bg-red-500/40 border border-red-400/50 mr-2 rounded"></div> Booked</div>
        <div className="flex items-center"><div className="w-4 h-4 bg-cyan-500/40 border border-cyan-400/50 mr-2 rounded"></div> Your Seat</div>
        <div className="flex items-center"><div className="w-4 h-4 bg-amber-500/40 border border-amber-400/50 mr-2 rounded"></div> Released</div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-white font-medium drop-shadow-md text-lg">Scanning availability...</div>
      ) : seats.length === 0 ? (
        <div className="text-center py-20 card max-w-2xl mx-auto border border-white/10 backdrop-blur-2xl bg-white/5">
          <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 shadow-inner">
            <div className="text-2xl text-white">S</div>
          </div>
          <h3 className="text-xl font-bold text-white drop-shadow-sm">No seats visible for this policy/date</h3>
          <p className="mt-3 text-gray-300 max-w-md mx-auto">Try another valid date window based on your batch rules and current time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-5">
          {filteredSeats.map((seat) => (
            <SeatCard key={seat.id} seat={seat} onBook={handleBook} onRelease={handleRelease} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Booking;
