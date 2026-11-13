import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, CheckCircle2, AlertCircle, LogIn, LogOut, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { Attendance } from '../../types';

export const StaffAttendance: React.FC = () => {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getMyAttendance();
      setAttendanceList(data);
    } catch (err: any) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setMessage(null);
      await api.attendanceCheckIn('Checked in from Staff Branch Portal');
      setMessage({ type: 'success', text: 'Check-in recorded successfully for today!' });
      await fetchAttendance();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Check-in failed. You may have already checked in today.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setMessage(null);
      await api.attendanceCheckOut();
      setMessage({ type: 'success', text: 'Check-out recorded successfully!' });
      await fetchAttendance();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Check-out failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayRecord = attendanceList.find(a => a.attendance_date === todayStr);

  const presentCount = attendanceList.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const lateCount = attendanceList.filter(a => a.status === 'LATE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Attendance & Time Clock</h1>
          <p className="text-sm text-slate-500 mt-1">Record daily branch attendance, check hours logged, and track monthly records</p>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
          <MapPin className="w-4 h-4 text-gold-500" />
          <span>Branch: MG Road HQ (Office Hours: 9:30 AM - 6:30 PM)</span>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Action Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-navy-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 rounded-full text-xs text-gold-400 font-semibold tracking-wide">
            <Clock className="w-3.5 h-3.5" />
            <span>Today's Date: {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
          <h2 className="text-xl font-bold">
            {todayRecord ? (
              todayRecord.check_out_time
                ? 'Status: Workday Completed (Checked Out)'
                : 'Status: Currently Logged In (Working)'
            ) : 'Status: Not Checked In Yet'}
          </h2>
          <p className="text-xs text-slate-300">
            {todayRecord?.check_in_time && `Check-In Time: ${new Date(todayRecord.check_in_time).toLocaleTimeString('en-IN')}`}
            {todayRecord?.check_out_time && ` | Check-Out Time: ${new Date(todayRecord.check_out_time).toLocaleTimeString('en-IN')}`}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleCheckIn}
            disabled={actionLoading || Boolean(todayRecord?.check_in_time)}
            className={`inline-flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
              todayRecord?.check_in_time
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Check In Now</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={actionLoading || !todayRecord?.check_in_time || Boolean(todayRecord?.check_out_time)}
            className={`inline-flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
              !todayRecord?.check_in_time || todayRecord?.check_out_time
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gold-500 hover:bg-gold-400 text-navy-950 active:scale-95'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>Check Out</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Days Present (This Month)</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{presentCount} Days</h3>
          <p className="text-xs text-emerald-600 mt-1">✓ Verified biometric / IP entries</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Late Arrivals</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{lateCount} Days</h3>
          <p className="text-xs text-slate-400 mt-1">Grace period: up to 15 mins</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Avg Working Hours</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">8.5 hrs/day</h3>
          <p className="text-xs text-slate-400 mt-1">Standard full-time roster</p>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">Monthly Attendance Log</h3>
          <span className="text-xs text-slate-500">Showing last 30 recorded shifts</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading attendance records...</div>
        ) : attendanceList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No attendance records found yet. Check in above!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Check In</th>
                  <th className="py-3 px-6">Check Out</th>
                  <th className="py-3 px-6">Hours</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      {new Date(item.attendance_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs">
                      {item.check_in_time ? new Date(item.check_in_time).toLocaleTimeString('en-IN') : '—'}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs">
                      {item.check_out_time ? new Date(item.check_out_time).toLocaleTimeString('en-IN') : '—'}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {item.work_hours} hrs
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'LATE'
                          ? 'bg-amber-100 text-amber-800'
                          : item.status === 'HALF_DAY'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500">
                      {item.notes || 'Normal shift'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
