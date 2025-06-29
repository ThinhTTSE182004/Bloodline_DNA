import React, { useEffect, useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import AdminSidebar from '../../components/AdminSidebar';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

const AdminPage = () => {
  const [medicalStaffs, setMedicalStaffs] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [workShifts, setWorkShifts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [loadingStats, setLoadingStats] = useState(false);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [satisfactionData, setSatisfactionData] = useState([]);
  const [mostUsedServiceData, setMostUsedServiceData] = useState([]);
  const [statsCache, setStatsCache] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        // Medical Staffs
        const medRes = await fetch('https://localhost:7113/api/ShiftAssignment/medical-staffs', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        setMedicalStaffs(medRes.ok ? await medRes.json() : []);
        // Staffs
        const staffRes = await fetch('https://localhost:7113/api/ShiftAssignment/staffs', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        setStaffs(staffRes.ok ? await staffRes.json() : []);
        // WorkShifts
        const shiftRes = await fetch('https://localhost:7113/api/WorkShift/WorkShift', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        setWorkShifts(shiftRes.ok ? await shiftRes.json() : []);
        // Services
        const serviceRes = await fetch('https://localhost:7113/api/Service/GetAllServiceWithPrice', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        setServices(serviceRes.ok ? await serviceRes.json() : []);
      } catch {
        setMedicalStaffs([]);
        setStaffs([]);
        setWorkShifts([]);
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Tổng hợp số liệu
  const totalMedicalStaff = medicalStaffs.length;
  const totalStaff = staffs.length;
  const totalWorkShifts = workShifts.length;
  const totalServices = services.length;
  const totalServiceValue = services.reduce((sum, s) => sum + (s.price || 0), 0);
  const serviceByCategory = services.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  // Pie chart tỷ lệ staff/medical staff (dùng SVG đơn giản)

  const pieData = [
    { name: 'Medical', value: totalMedicalStaff },
    { name: 'Staff', value: totalStaff }
  ];
  const COLORS = ['#34d399', '#2563eb']; // xanh lá, xanh dương

  // Sinh mảng ngày trong tháng
  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth(selectedMonth, selectedYear) }, (_, i) => i + 1);

  // Fetch 4 chỉ số cho từng ngày trong tháng, có cache
  useEffect(() => {
    const cacheKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    if (statsCache[cacheKey]) {
      setRevenueData(statsCache[cacheKey].revenueData);
      setOrdersData(statsCache[cacheKey].ordersData);
      setSatisfactionData(statsCache[cacheKey].satisfactionData);
      setMostUsedServiceData(statsCache[cacheKey].mostUsedServiceData);
      setLoadingStats(false);
      return;
    }
    const fetchStats = async () => {
      setLoadingStats(true);
      const revenueArr = [];
      const ordersArr = [];
      const satisfactionArr = [];
      const mostUsedArr = [];
      const token = localStorage.getItem('token');
      for (let day of daysArray) {
        const fromDate = new Date(selectedYear, selectedMonth, day, 0, 0, 0).toISOString();
        const toDate = new Date(selectedYear, selectedMonth, day, 23, 59, 59).toISOString();
        try {
          const res = await fetch('https://localhost:7113/api/Admin/dashboard', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ fromDate, toDate })
          });
          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          revenueArr.push({ day, value: data.totalRevenue });
          ordersArr.push({ day, value: data.totalOrders });
          satisfactionArr.push({ day, value: data.averageSatisfaction });
          mostUsedArr.push({ day, value: data.mostUsedService });
        } catch {
          revenueArr.push({ day, value: 0 });
          ordersArr.push({ day, value: 0 });
          satisfactionArr.push({ day, value: 0 });
          mostUsedArr.push({ day, value: '' });
        }
      }
      setRevenueData(revenueArr);
      setOrdersData(ordersArr);
      setSatisfactionData(satisfactionArr);
      setMostUsedServiceData(mostUsedArr);
      setStatsCache(prev => ({
        ...prev,
        [cacheKey]: {
          revenueData: revenueArr,
          ordersData: ordersArr,
          satisfactionData: satisfactionArr,
          mostUsedServiceData: mostUsedArr
        }
      }));
      setLoadingStats(false);
    };
    fetchStats();
  }, [selectedMonth, selectedYear, daysArray]);

  // Tính tần suất dịch vụ được dùng nhiều nhất trong tháng
  const serviceFrequency = mostUsedServiceData.reduce((acc, d) => {
    if (!d.value) return acc;
    acc[d.value] = (acc[d.value] || 0) + 1;
    return acc;
  }, {});
  const serviceFrequencyArr = Object.entries(serviceFrequency).map(([name, count]) => ({ name, count }));

  return (
    <>
      <AdminNavbar onSidebarToggle={() => setSidebarOpen(true)} />
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen bg-gray-100 py-10 px-4 pt-32 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-green-700 mb-8 text-center">Admin Dashboard</h1>
          {loading ? (
            <div className="text-center py-20 text-lg text-gray-500">Loading data...</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-10">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-green-400">
                  <span className="text-2xl font-bold text-green-700">{totalMedicalStaff}</span>
                  <span className="text-gray-600 mt-2">Medical Staff</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-blue-400">
                  <span className="text-2xl font-bold text-blue-700">{totalStaff}</span>
                  <span className="text-gray-600 mt-2">Staff</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-yellow-400">
                  <span className="text-2xl font-bold text-yellow-600">{totalWorkShifts}</span>
                  <span className="text-gray-600 mt-2">Work Shifts</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-purple-400">
                  <span className="text-2xl font-bold text-purple-700">{totalServices}</span>
                  <span className="text-gray-600 mt-2">Services</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-pink-400">
                  <span className="text-2xl font-bold text-pink-700">{totalServiceValue.toLocaleString()} VND</span>
                  <span className="text-gray-600 mt-2">Total Service Value</span>
                </div>
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border-t-4 border-gray-400">
                  <span className="text-2xl font-bold text-gray-700">{Object.keys(serviceByCategory).length}</span>
                  <span className="text-gray-600 mt-2">Service Categories</span>
                </div>
              </div>

              {/* Pie Chart Staff vs Medical Staff */}
              <div className="flex flex-col md:flex-row gap-8 mb-10 items-center justify-center">
                <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center w-full max-w-xs">
                  <span className="font-bold text-lg mb-2 text-green-700">Medical Staff / Staff Ratio</span>
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={70}
                        dataKey="value"
                      >
                        {pieData.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Service by Category */}
                <div className="bg-white rounded-xl shadow p-6 flex-1">
                  <span className="font-bold text-lg mb-2 text-purple-700 block">Services by Category</span>
                  <ul className="mt-2 space-y-1">
                    {Object.entries(serviceByCategory).map(([cat, count]) => (
                      <li key={cat} className="flex justify-between border-b py-1">
                        <span className="font-semibold text-gray-700">{cat}</span>
                        <span className="text-gray-600">{count} services</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Services Table */}
              <div className="bg-white rounded-xl shadow p-6 mb-10">
                <h2 className="text-xl font-bold text-purple-700 mb-4">Service List</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 border">Service Name</th>
                        <th className="px-4 py-2 border">Category</th>
                        <th className="px-4 py-2 border">Description</th>
                        <th className="px-4 py-2 border">Price (VND)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map(s => (
                        <tr key={s.servicePackageId} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border font-semibold text-gray-800">{s.serviceName}</td>
                          <td className="px-4 py-2 border">{s.category}</td>
                          <td className="px-4 py-2 border text-sm text-gray-600">{s.description}</td>
                          <td className="px-4 py-2 border text-right text-blue-700 font-bold">{s.price.toLocaleString()}</td>
                        </tr>
                      ))}
                      {services.length === 0 && (
                        <tr><td colSpan={4} className="text-center py-4 text-gray-400">No services available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Work Shifts Table */}
              <div className="bg-white rounded-xl shadow p-6 mb-10">
                <h2 className="text-xl font-bold text-yellow-700 mb-4">Work Shifts List</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 border">Shift Name</th>
                        <th className="px-4 py-2 border">Time</th>
                        <th className="px-4 py-2 border">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workShifts.map(s => (
                        <tr key={s.shiftId} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border font-semibold text-gray-800">{s.shiftName}</td>
                          <td className="px-4 py-2 border">{s.startTime?.slice(0,5)} - {s.endTime?.slice(0,5)}</td>
                          <td className="px-4 py-2 border text-sm text-gray-600">{s.description}</td>
                        </tr>
                      ))}
                      {workShifts.length === 0 && (
                        <tr><td colSpan={3} className="text-center py-4 text-gray-400">No work shifts available.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Staff Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold text-green-700 mb-4">Medical Staffs</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 border">ID</th>
                          <th className="px-4 py-2 border">Name</th>
                          <th className="px-4 py-2 border">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {medicalStaffs.map(s => (
                          <tr key={s.userId} className="hover:bg-green-50">
                            <td className="px-4 py-2 border">{s.userId}</td>
                            <td className="px-4 py-2 border font-semibold text-gray-800">{s.name}</td>
                            <td className="px-4 py-2 border">{s.roleName}</td>
                          </tr>
                        ))}
                        {medicalStaffs.length === 0 && (
                          <tr><td colSpan={3} className="text-center py-4 text-gray-400">No medical staff available.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow p-6">
                  <h2 className="text-xl font-bold text-blue-700 mb-4">Staffs</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-4 py-2 border">ID</th>
                          <th className="px-4 py-2 border">Name</th>
                          <th className="px-4 py-2 border">Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffs.map(s => (
                          <tr key={s.userId} className="hover:bg-blue-50">
                            <td className="px-4 py-2 border">{s.userId}</td>
                            <td className="px-4 py-2 border font-semibold text-gray-800">{s.name}</td>
                            <td className="px-4 py-2 border">{s.roleName}</td>
                          </tr>
                        ))}
                        {staffs.length === 0 && (
                          <tr><td colSpan={3} className="text-center py-4 text-gray-400">No staff available.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Month/Year Filter and Growth LineChart */}
              <div className="bg-white rounded-xl shadow p-6 mb-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
                  <h2 className="text-xl font-bold text-blue-700">Daily Growth Statistics</h2>
                  <div className="flex gap-2">
                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="border rounded px-2 py-1">
                      {Array.from({ length: 12 }, (_, i) => <option key={i} value={i}>{`Month ${i + 1}`}</option>)}
                    </select>
                    <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="border rounded px-2 py-1">
                      {Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                {loadingStats ? (
                  <div className="text-center py-8 text-gray-500">Loading statistics...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Total Revenue */}
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">Total Revenue</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" tickFormatter={d => `Day ${d}`} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Total Orders */}
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">Total Orders</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={ordersData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" tickFormatter={d => `Day ${d}`} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Average Satisfaction */}
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">Average Satisfaction</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={satisfactionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" tickFormatter={d => `Day ${d}`} />
                          <YAxis allowDecimals={true} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Most Used Service - Bar chart */}
                    <div>
                      <h3 className="font-semibold text-red-600 mb-2">Most Used Service This Month</h3>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={serviceFrequencyArr} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#ef4444" barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminPage; 