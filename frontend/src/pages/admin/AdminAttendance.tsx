import React, { useState, useEffect } from 'react';
import { CalendarCheck, Clock, Search, Filter, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { api } from '../../services/api';
import { Attendance } from '../../types';

export const AdminAttendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    loadAttendance();
  }, [selectedDate]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await api.getAllAttendance(selectedDate || undefined);
      setAttendanceRecords(data);
    } catch (err: any) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const lateCount = attendanceRecords.filter(a => a.status === 'LATE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company-Wide Attendance Roster</h1>
          <p className="text-sm text-slate-500 mt-1">Audit employee daily check-ins, punctuality metrics, working hours, and branch activity</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 outline-none shadow-sm"
          />
          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="text-xs text-navy-800 hover:underline font-semibold"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Logged Shifts</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{attendanceRecords.length} Records</h3>
          <p className="text-xs text-slate-400 mt-1">{selectedDate ? `For date: ${selectedDate}` : 'All recent logs'}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Present / Active</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">{presentCount} Present</h3>
          <p className="text-xs text-emerald-700 mt-1">✓ Logged within business hours</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Late Check-Ins</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{lateCount} Late</h3>
          <p className="text-xs text-slate-400 mt-1">Exceeded 9:45 AM threshold</p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 text-base">Recorded Attendance Logs</h3>
          <span className="text-xs text-slate-500">Auto-synchronized with office timeclock</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading attendance...</div>
        ) : attendanceRecords.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No attendance records found for this date.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Emp Code</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Check In</th>
                  <th className="py-3 px-6">Check Out</th>
                  <th className="py-3 px-6">Work Hours</th>
                  <th className="py-3 px-6">Late (Mins)</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceRecords.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-navy-900 text-xs">
                      EMP00{att.employee_id}
                    </td>
                    <td className="py-3.5 px-6 font-medium text-slate-900">
                      {new Date(att.attendance_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs">
                      {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString('en-IN') : '—'}
                    </td>
                    <td className="py-3.5 px-6 font-mono text-xs">
                      {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString('en-IN') : '—'}
                    </td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800">
                      {att.work_hours} hrs
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600">
                      {att.late_minutes > 0 ? `${att.late_minutes} min late` : 'On Time'}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        att.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.status === 'LATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-500">
                      {att.notes || 'Normal shift logged'}
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
