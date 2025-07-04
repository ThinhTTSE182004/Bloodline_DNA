import React, { useEffect, useState, useRef } from 'react';
import { FaRegCalendarAlt } from 'react-icons/fa';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import { motion } from 'framer-motion';


const daysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate();
};

const getMonthMatrix = (month, year) => {
  const firstDay = new Date(year, month, 1).getDay();
  const days = daysInMonth(month, year);
  const matrix = [];
  let week = [];
  let dayCount = 1;
  for (let i = 0; i < 6; i++) {
    week = [];
    for (let j = 0; j < 7; j++) {
      if ((i === 0 && j < firstDay) || dayCount > days) {
        week.push(null);
      } else {
        week.push(dayCount++);
      }
    }
    matrix.push(week);
  }
  return matrix;
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

  // Hỗ trợ chọn tháng/năm
  const monthSelectRef = useRef();
  const yearSelectRef = useRef();
  const handleMonthChange = (e) => setCurrentMonth(Number(e.target.value));
  const handleYearChange = (e) => setCurrentYear(Number(e.target.value));

  // Tính số lần được phân công trong tháng cho từng user
  const getAssignedCount = (userId) => suggestedAssignments.filter(a => a.userId === userId && new Date(a.assignmentDate).getMonth() === currentMonth).length;

  // Kiểm tra ngày hiện tại
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    // Medical Staffs
    fetch('https://localhost:7113/api/ShiftAssignment/medical-staffs', {
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
    // Staffs
    fetch('https://localhost:7113/api/ShiftAssignment/staffs', {
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
    fetch('https://localhost:7113/api/WorkShift/WorkShift', {
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
    fetch('https://localhost:7113/api/ShiftAssignment/SuggestAssignments', {
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

  const monthMatrix = getMonthMatrix(currentMonth, currentYear);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleAccept = async (assignment) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await fetch('https://localhost:7113/api/ShiftAssignment', {
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
      const res = await fetch('https://localhost:7113/api/ShiftAssignment/SuggestAssignments', {
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
        await fetch('https://localhost:7113/api/ShiftAssignment', {
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

  // Tách mảng ngày thành các tuần
  const weeks = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  // Ô ngày: vuông, chỉ hiện số ngày căn giữa, border mỏng xanh lá nhạt, nền trắng, không thông tin phụ
  const dayCellClass = 'bg-white border border-green-200 flex items-center justify-center text-lg font-bold text-green-900 rounded-md p-8 w-full h-full';

  return (
    <>
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-32 pb-8 w-4/5 mx-auto min-h-screen transition-all duration-300">
        {/* Modern Monthly Calendar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0 }}
          className="w-full flex flex-col items-center justify-center mb-8">
          <div className="relative w-full rounded-md shadow-none overflow-hidden bg-green-100" style={{marginTop: 0}}>
            {/* Header with light green color, rounded corners */}
            <div className="bg-green-200 p-6 flex flex-col items-center justify-center rounded-t-md border-b-0 relative">
              <FaRegCalendarAlt className="text-green-600 text-3xl mb-2 drop-shadow-lg" />
              <div className="flex items-center gap-2">
                <button className="text-green-700 border border-green-300 bg-white hover:bg-green-50 rounded-md px-3 py-1 transition text-lg font-bold" onClick={() => setCurrentMonth(m => m === 0 ? 11 : m - 1)}>&lt;</button>
                <select ref={monthSelectRef} value={currentMonth} onChange={handleMonthChange} className="rounded-md border border-green-300 px-2 py-1 text-green-900 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-green-300 text-lg">
                  {monthNames.map((name, idx) => <option key={name} value={idx}>{name}</option>)}
                </select>
                <select ref={yearSelectRef} value={currentYear} onChange={handleYearChange} className="rounded-md border border-green-300 px-2 py-1 text-green-900 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-green-300 text-lg">
                  {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button className="text-green-700 border border-green-300 bg-white hover:bg-green-50 rounded-md px-3 py-1 transition text-lg font-bold" onClick={() => setCurrentMonth(m => m === 11 ? 0 : m + 1)}>&gt;</button>
              </div>
              <span className="font-bold text-2xl text-green-700 tracking-wide mt-2 drop-shadow">Monthly Calendar</span>
            </div>
            {/* Calendar grid: square cells, only day numbers, thin borders, white background, 2px gap */}
            <div className="p-6 bg-green-100">
              <div className="grid grid-cols-7 gap-[2px]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center font-semibold text-green-700 bg-green-50 py-2 rounded-md tracking-wide text-base">{d}</div>
                ))}
                {monthMatrix.flat().map((day, idx) => {
                  const isToday = day && (new Date(currentYear, currentMonth, day).toISOString().slice(0, 10) === todayStr);
                  const dateStr = day ? new Date(currentYear, currentMonth, day).toISOString().slice(0, 10) : null;
                  return (
                    <div
                      key={idx}
                      className={`${dayCellClass} ${day ? (isToday ? 'ring-2 ring-green-400 cursor-pointer hover:bg-green-50' : 'cursor-pointer hover:bg-green-50') : 'bg-green-50 text-green-200 border-0 cursor-default'}`}
                      onClick={() => day && (setSelectedDate(dateStr), setShowPopup(true))}
                    >
                      {day || ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
        {/* 2 staff/medical staff tables */}
        <div className="flex flex-col md:flex-row gap-8 mb-10 w-full max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -40}}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8}}
            viewport={{ once: true }}
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
            initial={{ opacity: 0, x: 40}}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8}}
            viewport={{ once: true }}
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
          <div className="flex items-center gap-2">
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
          </div>
          <div className="flex items-center gap-2">
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
          </div>
          <motion.button
            initial={{ opacity: 0, scale: 0.8}}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8}}
            viewport={{ once: true }}
            className="px-4 py-2 bg-blue-600 text-white rounded font-bold shadow hover:bg-blue-700 transition"
            onClick={fetchSuggestedAssignments}
            disabled={loadingAutoAssign}
          >
            {loadingAutoAssign ? 'Auto-suggesting...' : 'Auto Assignment for Employee'}
          </motion.button>
          <motion.button
            initial={{ opacity: 0, scale: 0.8}}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8}}
            viewport={{ once: true }}
            className="px-4 py-2 bg-green-600 text-white rounded font-bold shadow hover:bg-green-700 transition"
            onClick={handleAcceptAll}
            disabled={loadingAcceptAll}
          >
            {loadingAcceptAll ? 'Confirming all...' : 'Accept Assignment All'}
          </motion.button>
        </div>
        {/* Shift assignment table by week */}
        <div className="mt-4">
          {weeks
            .map((weekDates, weekIdx) => ({ weekDates, weekIdx }))
            .filter(({ weekIdx }) => selectedWeek === 0 || selectedWeek === weekIdx + 1)
            .map(({ weekDates, weekIdx }) => (
              <motion.div 
                initial={{ opacity: 0, y: 40}}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8}}
                viewport={{ once: true }}
                key={`${weekIdx}-${selectedWeek}-${selectedShiftType}`} className="mb-10 bg-white rounded-2xl shadow-xl border border-blue-100 p-6 transition hover:shadow-2xl">
                <h3 className="font-semibold mb-4 text-blue-700 text-lg">Week {weekIdx + 1}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full w-full border border-blue-200 text-sm">
                    <thead>
                      <tr>
                        <th className="border px-2 py-2 bg-blue-50 text-blue-700">Shift / Day</th>
                        {weekDates.map(date => (
                          <th key={date} className="border px-2 py-2 bg-blue-50 text-blue-700">{date.slice(-2)}/{date.slice(5,7)}</th>
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
                        <tr key={shift.shiftId}>
                          <td className="border px-2 py-2 font-semibold bg-blue-50 text-blue-800">{shift.shiftName}</td>
                          {weekDates.map(date => (
                            <td key={date} className="border px-1 py-1 align-top min-w-[140px] bg-white hover:bg-blue-50 transition">
                              {suggestedAssignments
                                .filter(a => a.shiftId === shift.shiftId && a.assignmentDate === date)
                                .map(assignment => (
                                  <div key={assignment.userId} className="mb-2 p-2 rounded-xl bg-white shadow flex flex-col gap-1 group transition">
                                    <span className="truncate font-medium text-blue-900 group-hover:text-blue-700 text-base">{assignment.userName}</span>
                                    <span className="text-xs text-blue-500 mb-1">{assignment.roleName}</span>
                                    <span className="text-xs text-green-700 mb-1">Assignment count: {getAssignedCount(assignment.userId)}</span>
                                    <div className="flex justify-end">
                                      <button className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow hover:bg-green-600 transition flex items-center gap-1" onClick={() => handleAccept(assignment)} title="Accept shift assignment">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        Accept
                                      </button>
                                    </div>
                                  </div>
                                ))}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
        </div>
        {/* Shift assignment popup */}
        {showPopup && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-2xl relative">
              <button className="absolute top-2 right-4 text-2xl text-gray-400 hover:text-gray-700" onClick={() => setShowPopup(false)}>&times;</button>
              <h2 className="text-xl font-bold mb-4 text-green-700 text-center hover:text-green-600 transition-all duration-300">Shift Assignment for {selectedDate.split('-').reverse().join('/')}</h2>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="min-w-full border border-green-200">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="px-3 py-2 border">Employee Name</th>
                      <th className="px-3 py-2 border">Employee ID</th>
                      <th className="px-3 py-2 border">Role</th>
                      <th className="px-3 py-2 border">Shift Name</th>
                      <th className="px-3 py-2 border">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suggestedAssignments.filter(a => a.assignmentDate === selectedDate).length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-4 text-gray-400">No shift assignments for this date.</td></tr>
                    ) : (
                      suggestedAssignments.filter(a => a.assignmentDate === selectedDate).map(a => {
                        const shift = shifts.find(s => s.shiftId === a.shiftId);
                        return (
                          <tr key={a.userId + '-' + a.shiftId}>
                            <td className="border px-3 py-2">{a.userName}</td>
                            <td className="border px-3 py-2">{a.userId}</td>
                            <td className="border px-3 py-2">{a.roleName}</td>
                            <td className="border px-3 py-2">{shift ? shift.shiftName : ''}</td>
                            <td className="border px-3 py-2">{shift ? `${shift.startTime.slice(0,5)} - ${shift.endTime.slice(0,5)}` : ''}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default WorkAssignment; 