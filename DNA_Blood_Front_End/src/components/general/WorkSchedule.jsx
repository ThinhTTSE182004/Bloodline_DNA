import React, { useState } from "react";
import { startOfWeek, addDays, format, isSameDay } from "date-fns";

/**
 * WorkSchedule component
 * @param {Object[]} schedule
 * @param {number} month
 * @param {number} year
 */
export default function WorkSchedule({ schedule, month, year }) {
  const [currentWeek, setCurrentWeek] = useState(0);

  // Generate weeks in the month
  const getWeeksInMonth = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    let weeks = [];
    let weekStart = startOfWeek(firstDay, { weekStartsOn: 1 }); // Monday
    while (weekStart <= lastDay) {
      weeks.push(
        Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
      );
      weekStart = addDays(weekStart, 7);
    }
    return weeks;
  };

  const weeks = getWeeksInMonth();

  return (
    <div
      className="w-[100%] mx-auto my-4 p-6 bg-white rounded-xl shadow-lg flex flex-col"
      style={{ minHeight: "auto", height: "auto" }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
          onClick={() => setCurrentWeek((w) => Math.max(w - 1, 0))}
          disabled={currentWeek === 0}
        >
          Previous week
        </button>
        <span className="font-semibold text-xl">
          Week {currentWeek + 1} / {weeks.length}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
          onClick={() => setCurrentWeek((w) => Math.min(w + 1, weeks.length - 1))}
          disabled={currentWeek === weeks.length - 1}
        >
          Next week
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 gap-4 h-full">
          {weeks[currentWeek].map((date, idx) => {
            const daySchedule = schedule.filter(
              (item) => isSameDay(new Date(item.assignmentDate), date)
            );
            return (
              <div
                key={idx}
                className="flex flex-col items-center border border-gray-200 rounded-lg bg-gray-50 p-2 h-full min-h-[120px] shadow-sm"
              >
                <div className="font-bold text-blue-700 mb-2 text-base">
                  {format(date, "EEE")}
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {format(date, "dd/MM/yyyy")}
                </div>
                <div className="flex-1 w-full flex flex-col gap-2">
                  {daySchedule.length > 0 ? (
                    daySchedule.map((item) => (
                      <div
                        key={item.assignmentId}
                        className="bg-blue-100 text-blue-900 rounded p-1 text-xs w-full text-center"
                      >
                        <div className="font-semibold">{item.shiftName}</div>
                        <div>{item.startTime} - {item.endTime}</div>
                        <div className="italic text-gray-600">{item.description}</div>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-400 text-xs">No shift</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 