"use client"

// Calendar component with modern white/blue design
export default function Calendar({ 
  currentMonth, 
  currentYear, 
  onMonthChange, 
  onYearChange, 
  onDateSelect,
  selectedDate,
  assignments = [] // Assignment data to display on calendar
}) {

  // Helper functions for calendar grid
  const daysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getMonthMatrix = (month, year) => {
    const firstDay = new Date(year, month, 1).getDay()
    const days = daysInMonth(month, year)
    const matrix = []
    let week = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      week.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= days; day++) {
      week.push(day)
      if (week.length === 7) {
        matrix.push(week)
        week = []
      }
    }
    
    // Add remaining days to complete the last week
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null)
      }
      matrix.push(week)
    }
    
    return matrix
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const monthMatrix = getMonthMatrix(currentMonth, currentYear)
  // Create today's date string in local timezone
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Helper function to get assignments for a specific date
  const getAssignmentsForDate = (dateStr) => {
    return assignments.filter(assignment => assignment.assignmentDate === dateStr)
  }

  // Helper function to get assignment summary
  const getAssignmentSummary = (dateStr) => {
    const dayAssignments = getAssignmentsForDate(dateStr)
    if (dayAssignments.length === 0) return null

    const medicalStaffCount = dayAssignments.filter(a => a.isMedicalStaff).length
    const regularStaffCount = dayAssignments.length - medicalStaffCount

    return {
      total: dayAssignments.length,
      medical: medicalStaffCount,
      regular: regularStaffCount
    }
  }

  return (
    <div className="w-full flex flex-col items-center justify-center mb-8">
      <div className="relative w-full rounded-lg shadow-lg overflow-hidden bg-white border border-blue-100">
        {/* Header with blue color scheme */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 flex flex-col items-center justify-center rounded-t-lg">
          <div className="flex items-center gap-3 mb-2">
            <button 
              className="text-white border border-white/30 bg-white/10 hover:bg-white/20 rounded-md px-3 py-1 transition text-lg font-bold backdrop-blur-sm" 
              onClick={() => onMonthChange(currentMonth === 0 ? 11 : currentMonth - 1)}
            >
              &lt;
            </button>
            <select 
              value={currentMonth} 
              onChange={(e) => onMonthChange(Number(e.target.value))} 
              className="rounded-md border border-white/30 px-3 py-1 text-white bg-white/10 font-bold focus:outline-none focus:ring-2 focus:ring-white/50 text-lg backdrop-blur-sm"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx} className="text-gray-800">{name}</option>
              ))}
            </select>
            <select 
              value={currentYear} 
              onChange={(e) => onYearChange(Number(e.target.value))} 
              className="rounded-md border border-white/30 px-3 py-1 text-white bg-white/10 font-bold focus:outline-none focus:ring-2 focus:ring-white/50 text-lg backdrop-blur-sm"
            >
              {Array.from({length: 5}, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                <option key={y} value={y} className="text-gray-800">{y}</option>
              ))}
            </select>
            <button 
              className="text-white border border-white/30 bg-white/10 hover:bg-white/20 rounded-md px-3 py-1 transition text-lg font-bold backdrop-blur-sm" 
              onClick={() => onMonthChange(currentMonth === 11 ? 0 : currentMonth + 1)}
            >
              &gt;
            </button>
          </div>
          <span className="font-bold text-2xl text-white tracking-wide drop-shadow">Monthly Calendar</span>
        </div>
        
        {/* Calendar grid with modern design */}
        <div className="p-6 bg-white">
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center font-semibold text-blue-700 bg-blue-50 py-3 rounded-md tracking-wide text-sm">
                {d}
              </div>
            ))}
            {monthMatrix.flat().map((day, idx) => {
              // Create date in local timezone to avoid timezone issues
              const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null
              const isToday = day && (dateStr === todayStr)
              const isSelected = selectedDate === dateStr
              const assignmentSummary = dateStr ? getAssignmentSummary(dateStr) : null
              
              return (
                <div
                  key={idx}
                  className={`
                    min-h-[80px] p-2 border border-blue-100 rounded-md transition-all duration-200 cursor-pointer
                    ${day 
                      ? isToday 
                        ? 'bg-blue-100 border-blue-300 ring-2 ring-blue-400 hover:bg-blue-200' 
                        : isSelected
                          ? 'bg-blue-500 text-white hover:bg-blue-600'
                          : 'bg-white hover:bg-blue-50 text-blue-900'
                      : 'bg-gray-50 text-gray-300 border-gray-100 cursor-default'
                    }
                  `}
                  onClick={() => day && onDateSelect(dateStr)}
                >
                  <div className="text-center font-bold text-lg mb-1">
                    {day || ''}
                  </div>
                  
                  {/* Simple text assignment indicators */}
                  {assignmentSummary && (
                    <div className="text-xs text-center space-y-0.5">
                      <div className={`font-medium ${
                        isSelected ? 'text-white' : 'text-blue-700'
                      }`}>
                        {assignmentSummary.total} assignments
                      </div>
                      {assignmentSummary.medical > 0 && (
                        <div className={`${
                          isSelected ? 'text-rose-200' : 'text-rose-600'
                        }`}>
                          {assignmentSummary.medical} medical
                        </div>
                      )}
                      {assignmentSummary.regular > 0 && (
                        <div className={`${
                          isSelected ? 'text-blue-200' : 'text-blue-600'
                        }`}>
                          {assignmentSummary.regular} staff
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
} 