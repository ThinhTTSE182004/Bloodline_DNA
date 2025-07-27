import React, { useEffect, useState } from 'react';
import { FaRegCalendarAlt } from 'react-icons/fa';
import AdminNavbar from '../../components/admin/AdminNavbar';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Calendar from '../../components/admin/Calendar';
import ExpandableAssignmentCard from '../../components/admin/ExpandableAssignmentCard';
import { motion } from 'framer-motion';


const daysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};



const WorkAssignment = () => {
  const [medicalStaffs, setMedicalStaffs] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [suggestedAssignments, setSuggestedAssignments] = useState([]);
  const [dates, setDates] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [maxShiftPerMonth] = useState(20);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingAutoAssign, setLoadingAutoAssign] = useState(false);
  const [loadingAcceptAll, setLoadingAcceptAll] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedShiftType, setSelectedShiftType] = useState('all');
  const [allAssignments, setAllAssignments] = useState([]);

  const getAssignedCount = (userId) => suggestedAssignments.filter(a => a.userId === userId && new Date(a.assignmentDate).getMonth() === currentMonth).length;

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    fetch('/api/ShiftAssignment/medical-staffs', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        console.log('MedicalStaffs API response:', data, 'Type:', typeof data, Array.isArray(data));
        setMedicalStaffs(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setMedicalStaffs([]);
        console.error('MedicalStaffs API error:', err);
      });
    fetch('/api/ShiftAssignment/staffs', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        console.log('Staffs API response:', data, 'Type:', typeof data, Array.isArray(data));
        setStaffs(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setStaffs([]);
        console.error('Staffs API error:', err);
      });
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    fetch('/api/WorkShift/WorkShift', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setShifts(Array.isArray(data) ? data.map(s => ({
          shiftId: s.shiftId,
          shiftName: s.shiftName,
          startTime: s.startTime,
          endTime: s.endTime
        })) : []);
      })
      .catch(err => {
        setShifts([]);
        console.error('WorkShift API error:', err);
      });
    const days = daysInMonth(currentMonth, currentYear);
    const dateList = Array.from({ length: days }, (_, i) => {
      const d = new Date(currentYear, currentMonth, i + 1);
      return d.toISOString().slice(0, 10);
    });
    setDates(dateList);
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (shifts.length === 0 || dates.length === 0 || (medicalStaffs.length === 0 && staffs.length === 0)) return;
    console.log('--- DEBUG SUGGEST ASSIGNMENTS ---');
    console.log('medicalStaffs:', medicalStaffs);
    console.log('staffs:', staffs);
    console.log('shifts:', shifts);
    console.log('dates:', dates);
    console.log('maxShiftPerMonth:', maxShiftPerMonth);
    const body = {
      shifts: shifts.map(s => ({
        shiftId: s.shiftId,
        shiftName: s.shiftName,
        startTime: s.startTime,
        endTime: s.endTime
      })),
      users: [...medicalStaffs, ...staffs].map(u => ({
        userId: u.userId,
        name: u.name,
        roleId: u.roleId,
        roleName: u.roleName
      })),
      dates,
      maxShiftPerMonth
    };
    console.log('SuggestAssignments body:', body);
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    fetch('/api/ShiftAssignment/SuggestAssignments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(body)
    })
      .then(async res => {
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSuggestedAssignments(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setSuggestedAssignments([]);
        console.error('SuggestAssignments API error:', err);
      });
  }, [shifts, dates, medicalStaffs, staffs, maxShiftPerMonth]);

  useEffect(() => {
    const fetchAllAssignments = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        const response = await fetch('/api/ShiftAssignment/AllAssignments', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const data = await response.json();

        const staffsResponse = await fetch('/api/ShiftAssignment/staffs', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        const medicalStaffsResponse = await fetch('/api/ShiftAssignment/medical-staffs', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });

        if (!staffsResponse.ok || !medicalStaffsResponse.ok) {
          throw new Error('Failed to fetch staff data');
        }

        const medicalStaffsData = await medicalStaffsResponse.json();

        const enhancedAssignments = data.map(assignment => {
          const isMedicalStaff = medicalStaffsData.some(ms => ms.userId === assignment.userId);
          return {
            ...assignment,
            isMedicalStaff
          };
        });

        setAllAssignments(enhancedAssignments);
      } catch (err) {
        console.error('Error fetching all assignments:', err);
        setAllAssignments([]);
      }
    };

    fetchAllAssignments();
  }, []);



  const handleAccept = async (assignment) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('/api/ShiftAssignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: assignment.userId,
          shiftId: assignment.shiftId,
          assignmentDate: assignment.assignmentDate
        })
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Assignment confirmed for ' + assignment.userName);
    } catch (err) {
      alert('Error confirming assignment: ' + err.message);
    }
  };

  const fetchSuggestedAssignments = async () => {
    setLoadingAutoAssign(true);
    try {
      const body = {
        shifts: shifts.map(s => ({
          shiftId: s.shiftId,
          shiftName: s.shiftName,
          startTime: s.startTime,
          endTime: s.endTime
        })),
        users: [...medicalStaffs, ...staffs].map(u => ({
          userId: u.userId,
          name: u.name,
          roleId: u.roleId,
          roleName: u.roleName
        })),
        dates,
        maxShiftPerMonth
      };
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('/api/ShiftAssignment/SuggestAssignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSuggestedAssignments(Array.isArray(data) ? data : []);
    } catch (err) {
      setSuggestedAssignments([]);
      alert('Error auto-suggesting assignments: ' + err.message);
    } finally {
      setLoadingAutoAssign(false);
    }
  };

  const handleAcceptAll = async () => {
    setLoadingAcceptAll(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      for (const a of suggestedAssignments) {
        await fetch('/api/ShiftAssignment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            userId: a.userId,
            shiftId: a.shiftId,
            assignmentDate: a.assignmentDate
          })
        });
      }
      alert('All assignments confirmed!');
    } catch (err) {
      alert('Error confirming all assignments: ' + err.message);
    } finally {
      setLoadingAcceptAll(false);
    }
  };

  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }



  return (
    <>
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-32 pb-8 w-11/12 mx-auto min-h-screen transition-all duration-300">
        {/* Modern Monthly Calendar */}
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Calendar
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={setCurrentMonth}
            onYearChange={setCurrentYear}
            onDateSelect={(dateStr) => {
              setSelectedDate(dateStr);
              setShowPopup(true);
            }}
            selectedDate={selectedDate}
            assignments={allAssignments}
          />
        </motion.div>
        {/* 2 staff/medical staff tables */}
        <div className="flex flex-col md:flex-row gap-8 mb-10 w-full max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 bg-white rounded-xl shadow-lg p-6 max-h-96 overflow-y-auto border border-blue-100">
            <h2 className="font-semibold mb-2 text-blue-700">Medical Staffs</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-1 text-blue-700">ID</th>
                  <th className="py-1 text-blue-700">Name</th>
                  <th className="py-1 text-blue-700">Assignment Count</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(medicalStaffs) && medicalStaffs.map(staff => (
                  <tr key={staff.userId} className="border-t hover:bg-blue-50 transition">
                    <td className="py-1">{staff.userId}</td>
                    <td className="py-1">{staff.name}</td>
                    <td className="py-1 text-center font-semibold text-green-700">{getAssignedCount(staff.userId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex-1 bg-white rounded-xl shadow-lg p-6 max-h-96 overflow-y-auto border border-blue-100">
            <h2 className="font-semibold mb-2 text-blue-700">Staffs</h2>
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="py-1 text-blue-700">ID</th>
                  <th className="py-1 text-blue-700">Name</th>
                  <th className="py-1 text-blue-700">Assignment Count</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(staffs) && staffs.map(staff => (
                  <tr key={staff.userId} className="border-t hover:bg-blue-50 transition">
                    <td className="py-1">{staff.userId}</td>
                    <td className="py-1">{staff.name}</td>
                    <td className="py-1 text-center font-semibold text-green-700">{getAssignedCount(staff.userId)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
        {/* Filter + Auto Assignment and Accept Assignment All buttons for shift assignment table by week */}
        <div className="flex flex-wrap gap-4 mb-4 items-center justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0 }}
            className="flex items-center gap-2">
            <label className="font-semibold text-blue-700">Filter by week:</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedWeek}
              onChange={e => setSelectedWeek(Number(e.target.value))}
            >
              <option value={0}>All weeks</option>
              {weeks.map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>Week {idx + 1}</option>
              ))}
            </select>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-2">
            <label className="font-semibold text-blue-700">Filter by shift:</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedShiftType}
              onChange={e => setSelectedShiftType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
            </select>
          </motion.div>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 transition"
            onClick={fetchSuggestedAssignments}
            disabled={loadingAutoAssign}
          >
            {loadingAutoAssign ? 'Auto-suggesting...' : 'Auto Assignment for Employee'}
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="px-4 py-2 bg-green-600 text-white rounded font-bold shadow hover:bg-green-700 transition"
            onClick={handleAcceptAll}
            disabled={loadingAcceptAll}
          >
            {loadingAcceptAll ? 'Confirming all...' : 'Accept Assignment All'}
          </motion.button>
        </div>
        {/* Professional Shift Assignment Table */}
        <div className="mt-6 w-full">
          {weeks
            .map((weekDates, weekIdx) => ({ weekDates, weekIdx }))
            .filter(({ weekIdx }) => selectedWeek === 0 || selectedWeek === weekIdx + 1)
            .map(({ weekDates, weekIdx }) => (
              <motion.div
                key={`${weekIdx}-${selectedWeek}-${selectedShiftType}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full"
              >
                {/* Compact Professional Header */}
                <div className="bg-gradient-to-r from-slate-700 to-slate-800 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base">Week {weekIdx + 1}</h3>
                      <p className="text-slate-300 text-xs">Assignment Overview</p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-3 py-2 text-slate-700 font-medium text-left min-w-[90px]">
                          <div className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Shift</span>
                          </div>
                        </th>
                        {weekDates.map(date => (
                          <th key={date} className="px-2 py-2 text-slate-700 font-medium text-center border-l border-slate-200 min-w-[100px]">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                              <span className="text-xs font-bold text-slate-800">
                                {date.slice(-2)}/{date.slice(5, 7)}
                              </span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {shifts
                        .filter(shift => {
                          if (selectedShiftType === 'morning') return shift.shiftName && shift.shiftName.toLowerCase().includes('morning');
                          if (selectedShiftType === 'afternoon') return shift.shiftName && shift.shiftName.toLowerCase().includes('afternoon');
                          return true;
                        })
                        .map(shift => (
                          <tr key={shift.shiftId} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-3 font-medium text-slate-800 bg-slate-50/70 border-r border-slate-200">
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-slate-900 text-sm">{shift.shiftName}</span>
                                <span className="text-xs text-slate-600 font-mono">
                                  {shift.startTime?.slice(0, 5) || ''} - {shift.endTime?.slice(0, 5) || ''}
                                </span>
                              </div>
                            </td>
                            {weekDates.map(date => {
                              const dayAssignments = suggestedAssignments.filter(
                                a => a.shiftId === shift.shiftId && a.assignmentDate === date
                              );

                              // Separate medical staff and regular staff
                              const medicalStaffAssignments = dayAssignments.filter(assignment => {
                                const medicalStaff = medicalStaffs.find(ms => ms.userId === assignment.userId);
                                return medicalStaff;
                              });

                              const regularStaffAssignments = dayAssignments.filter(assignment => {
                                const regularStaff = staffs.find(s => s.userId === assignment.userId);
                                return regularStaff;
                              });

                              return (
                                <td key={date} className="px-2 py-3 align-top bg-white border-r border-slate-100">
                                  <div className="space-y-2">
                                    {/* Medical Staff Section */}
                                    {medicalStaffAssignments.length > 0 && (
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                                          <span className="text-xs font-medium text-slate-700">
                                            Medical Staff ({medicalStaffAssignments.length})
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          {medicalStaffAssignments.map((assignment) => (
                                            <div key={assignment.userId} className="flex items-center justify-between p-2 bg-rose-50/60 rounded-md border border-rose-100/50 hover:bg-rose-50/80 transition-colors">
                                              <span className="truncate text-sm font-medium text-slate-700">
                                                {assignment.userName}
                                              </span>
                                              <button
                                                className="ml-2 p-1 bg-rose-500/80 text-white rounded-md text-xs hover:bg-rose-600 transition-colors"
                                                onClick={() => handleAccept(assignment)}
                                                title="Accept assignment"
                                              >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Regular Staff Section */}
                                    {regularStaffAssignments.length > 0 && (
                                      <div>
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                          <span className="text-xs font-medium text-slate-700">
                                            Staff ({regularStaffAssignments.length})
                                          </span>
                                        </div>
                                        <div className="space-y-1">
                                          {regularStaffAssignments.map((assignment) => (
                                            <div key={assignment.userId} className="flex items-center justify-between p-2 bg-blue-50/60 rounded-md border border-blue-100/50 hover:bg-blue-50/80 transition-colors">
                                              <span className="truncate text-sm font-medium text-slate-700">
                                                {assignment.userName}
                                              </span>
                                              <button
                                                className="ml-2 p-1 bg-blue-500/80 text-white rounded-md text-xs hover:bg-blue-600 transition-colors"
                                                onClick={() => handleAccept(assignment)}
                                                title="Accept assignment"
                                              >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Empty state */}
                                    {dayAssignments.length === 0 && (
                                      <div className="text-center py-2 text-slate-400 text-xs">
                                        <svg className="w-3 h-3 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        No assignments
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
        </div>
        {/* Expandable Assignment Card */}
        {showPopup && selectedDate && (
          <ExpandableAssignmentCard
            selectedDate={selectedDate}
            shifts={shifts}
            onClose={() => setShowPopup(false)}
          />
        )}
      </div>
    </>
  );
};

export default WorkAssignment; 