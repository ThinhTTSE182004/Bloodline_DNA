"use client"

import React, { useState } from "react"
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  CheckCircle, 
  User,
  Building,
  Star
} from "lucide-react"

// Assignment Card Component for displaying shift assignments
export default function AssignmentCard({ 
  selectedDate, 
  assignments = [], 
  shifts = [],
  onAcceptAssignment,
  onClose 
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Group assignments by shift
  const assignmentsByShift = assignments.reduce((acc, assignment) => {
    const shift = shifts.find(s => s.shiftId === assignment.shiftId)
    const shiftName = shift ? shift.shiftName : 'Unknown Shift'
    
    if (!acc[shiftName]) {
      acc[shiftName] = {
        shift: shift,
        assignments: []
      }
    }
    acc[shiftName].assignments.push(assignment)
    return acc
  }, {})

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getShiftTime = (shift) => {
    if (!shift) return ''
    return `${shift.startTime?.slice(0, 5) || ''} - ${shift.endTime?.slice(0, 5) || ''}`
  }

  const getAssignmentCount = (userId) => {
    return assignments.filter(a => a.userId === userId).length
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Shift Assignments</h2>
                <p className="text-blue-100">{formatDate(selectedDate)}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {Object.keys(assignmentsByShift).length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Assignments</h3>
              <p className="text-gray-500">No shift assignments for this date.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(assignmentsByShift).map(([shiftName, shiftData], shiftIndex) => (
                <div key={shiftName} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  {/* Shift Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{shiftName}</h3>
                        <p className="text-sm text-gray-600">
                          {getShiftTime(shiftData.shift)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {shiftData.assignments.length} Staff
                      </span>
                    </div>
                  </div>

                  {/* Staff List */}
                  <div className="grid gap-3">
                    {shiftData.assignments.map((assignment, index) => (
                      <div 
                        key={`${assignment.userId}-${assignment.shiftId}`}
                        className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{assignment.userName}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {assignment.roleName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {getAssignmentCount(assignment.userId)} assignments
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => onAcceptAssignment(assignment)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total: {assignments.length} assignments</span>
            <span>{Object.keys(assignmentsByShift).length} shifts</span>
          </div>
        </div>
      </div>
    </div>
  )
} 