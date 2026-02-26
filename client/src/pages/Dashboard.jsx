import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Calendar as CalendarIcon, Clock, Users, CheckCircle, Building, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const getLocalDateKey = (date = new Date()) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const StatsCard = ({ title, value, icon: Icon, color }) => (
  <div className="card p-6 flex items-center shadow-lg hover:-translate-y-1 transition-transform duration-300">
    <div className={`p-4 rounded-xl ${color} bg-opacity-20 mr-5 ring-1 ring-inset ${color.replace('bg-', 'ring-')}/30`}>
      <Icon className={`w-7 h-7 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">{title}</p>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayBooking, setTodayBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rotationInfo, setRotationInfo] = useState(null);
  const [floatingPool, setFloatingPool] = useState(null);

  useEffect(() => {
    fetchTodayBooking();
    fetchOperationalMeta();

    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchOperationalMeta = async () => {
    try {
      const todayStr = getLocalDateKey();
      const [rotationRes, floatingRes] = await Promise.all([
        api.get(`/rotation?date=${todayStr}`),
        api.get(`/floating-stats?date=${todayStr}`),
      ]);

      setRotationInfo(rotationRes.data || null);
      setFloatingPool(floatingRes.data?.floatingPool || null);
    } catch (err) {
      console.error('Failed to load dashboard metadata', err);
    }
  };

  const fetchTodayBooking = async () => {
    try {
      const todayStr = getLocalDateKey();
      const res = await api.get(`/my-bookings?date=${todayStr}`);

      if (res.data && res.data.length > 0) {
        const active = res.data.find((b) => b.status === 'BOOKED');
        setTodayBooking(active || null);
      } else {
        setTodayBooking(null);
      }
    } catch (err) {
      console.error("Failed to fetch today's booking", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseToday = async () => {
    if (!todayBooking) return;

    try {
      const todayStr = getLocalDateKey();
      await api.post('/release-seat', { date: todayStr, seat_id: todayBooking.seat_id });
      toast.success('Seat released successfully for today!');
      setTodayBooking(null);
      fetchOperationalMeta();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to release seat');
    }
  };

  const isWorkingToday = () => Number(rotationInfo?.activeBatch) === Number(user?.batch);

  const formatTime = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date) =>
    date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const isWeekendFromRotation = rotationInfo?.dayOfWeek === 0 || rotationInfo?.dayOfWeek === 6;
  const activeBatchText = !rotationInfo
    ? 'Loading'
    : rotationInfo.activeBatch
      ? `Batch ${rotationInfo.activeBatch}`
      : isWeekendFromRotation
        ? 'Weekend'
        : 'Unavailable';

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="md:flex md:items-center md:justify-between mb-10">
        <div className="flex-1 min-w-0">
          <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl sm:truncate tracking-tight drop-shadow-md py-1">
            Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 pb-1">{user?.name}</span>
          </h2>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center text-sm text-gray-300 gap-2 sm:gap-6">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-cyan-400" />
              <span className="font-semibold text-white tracking-wider font-mono">{formatTime(currentDate)}</span>
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2 text-blue-400" />
              <span>{formatDate(currentDate)}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-purple-400" />
              <span className="font-medium bg-white/10 px-2 py-0.5 rounded border border-white/20">
                {activeBatchText === 'Loading'
                  ? 'Loading batch...'
                  : activeBatchText === 'Weekend'
                    ? 'Weekend (No Batches)'
                    : activeBatchText === 'Unavailable'
                      ? 'Batch Unavailable'
                      : `${activeBatchText} Active`}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-6 flex md:mt-0 md:ml-4">
          <Link to="/book" className="btn-primary flex items-center shadow-cyan-500/20 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-500/30 border border-cyan-400/30">
            <CalendarIcon className="w-5 h-5 mr-2" /> Book a Seat
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Your Batch"
          value={`Batch ${user?.batch}`}
          icon={Users}
          color="bg-blue-400"
        />
        <StatsCard
          title="Working Today?"
          value={isWorkingToday() ? 'Yes - Batch Day' : 'No - Non-Batch'}
          icon={isWorkingToday() ? CheckCircle : Clock}
          color={isWorkingToday() ? 'bg-cyan-400' : 'bg-gray-400'}
        />
        <StatsCard
          title="Total Seats"
          value="50"
          icon={Building}
          color="bg-indigo-400"
        />
        <StatsCard
          title="Floating Capacity"
          value={floatingPool?.effectiveFloating ?? 10}
          icon={CalendarIcon}
          color="bg-teal-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 card p-8 backdrop-blur-xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center drop-shadow-sm">
            <Clock className="w-5 h-5 mr-3 text-white opacity-90" /> Quick Actions & Info
          </h3>
          <div className="bg-black/20 rounded-xl p-5 border border-white/10 mb-6 shadow-inner">
            <ul className="list-disc list-inside text-gray-200 space-y-3 leading-relaxed">
              <li>Batch-day users can book <span className="font-bold text-white">designated seats</span> up to 14 days ahead.</li>
              <li>Non-batch users can book <span className="font-bold text-emerald-300">floating or released seats</span> only after 3 PM.</li>
              <li>Non-batch booking target must be the <span className="font-bold text-pink-300">next working day</span>.</li>
              <li>Weekend and past-date booking requests are blocked at backend level.</li>
            </ul>
          </div>
          <Link to="/weekly" className="text-white hover:text-indigo-200 font-semibold inline-flex items-center transition-colors px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 border border-white/10">
            View the overall weekly schedule <span className="ml-2 text-lg">&rarr;</span>
          </Link>
        </div>

        <div className="card p-8 bg-white/10 border border-white/20 backdrop-blur-xl relative overflow-hidden flex flex-col justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.2)]">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
          <h3 className="text-xl font-bold text-white mb-4 drop-shadow-sm flex items-center">
            Your Seat Today
          </h3>
          {loading ? (
            <p className="text-gray-400">Loading seat info...</p>
          ) : todayBooking ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg mb-4 border border-white/20">
                <span className="text-3xl font-extrabold drop-shadow-md">{todayBooking.seat_number}</span>
              </div>
              <p className="text-white font-medium mb-1">You are booked for Seat {todayBooking.seat_number}</p>
              <p className="text-gray-300 text-sm mb-6">Have an excellent workday!</p>
              <button
                onClick={handleReleaseToday}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-500/50 text-sm font-medium rounded-lg text-red-200 bg-red-500/20 hover:bg-red-500/40 hover:text-white transition-all focus:outline-none"
              >
                <XCircle className="h-4 w-4 mr-2" />
                On Leave? Release Seat
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                <CalendarIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-300 mb-4">No seat selected for today.</p>
              <Link to="/book" className="text-gray-300 hover:text-white font-medium text-sm border-b border-transparent hover:border-gray-400 transition-colors">
                Book one now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
