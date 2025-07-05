"use client"

import React, { useState, useEffect } from "react"
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  User,
  Building,
  Star,
  X,
  Award,
  Briefcase
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage,
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./ui"

// Expandable Assignment Card Component
export default function ExpandableAssignmentCard({ 
  selectedDate, 
  shifts = [],
  onClose 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [staffs, setStaffs] = useState([])
  const [medicalStaffs, setMedicalStaffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch all data from APIs
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const token = sessionStorage.getItem('token') || localStorage.getItem('token')
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {}
        
        // Fetch assignments
        const assignmentsResponse = await fetch('https://localhost:7113/api/ShiftAssignment/AllAssignments', {
          headers
        })
        
        // Fetch staffs
        const staffsResponse = await fetch('https://localhost:7113/api/ShiftAssignment/staffs', {
          headers
        })
        
        // Fetch medical staffs
        const medicalStaffsResponse = await fetch('https://localhost:7113/api/ShiftAssignment/medical-staffs', {
          headers
        })
        
        if (!assignmentsResponse.ok || !staffsResponse.ok || !medicalStaffsResponse.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const assignmentsData = await assignmentsResponse.json()
        const staffsData = await staffsResponse.json()
        const medicalStaffsData = await medicalStaffsResponse.json()
        
        // Filter assignments for the selected date
        const filteredAssignments = assignmentsData.filter(assignment => 
          assignment.assignmentDate === selectedDate
        )
        
        setAssignments(filteredAssignments)
        setStaffs(staffsData)
        setMedicalStaffs(medicalStaffsData)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (selectedDate) {
      fetchAllData()
    }
  }, [selectedDate])

  // Group assignments by shift with enhanced data
  const assignmentsByShift = assignments.reduce((acc, assignment) => {
    const shift = shifts.find(s => s.shiftId === assignment.shiftId)
    const shiftName = shift ? shift.shiftName : `Shift ${assignment.shiftId}`
    
    // Find staff information
    const staff = staffs.find(s => s.userId === assignment.userId)
    const medicalStaff = medicalStaffs.find(ms => ms.userId === assignment.userId)
    const staffInfo = staff || medicalStaff
    
    if (!acc[shiftName]) {
      acc[shiftName] = {
        shift: shift,
        assignments: []
      }
    }
    
    acc[shiftName].assignments.push({
      ...assignment,
      staffInfo,
      isMedicalStaff: !!medicalStaff
    })
    
    return acc
  }, {})

  const formatDate = (dateStr) => {
    // Parse date string and create date in local timezone
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day) // month is 0-indexed
    
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

  const handleExpand = () => {
    setIsExpanded(true)
  }

  const handleCollapse = () => {
    setIsExpanded(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isExpanded ? 0.8 : 0.4 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black"
        onClick={onClose}
      />
      
      {/* Main Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: isExpanded ? 1 : 0.9,
          opacity: 1,
          width: isExpanded ? "90vw" : "400px",
          height: isExpanded ? "80vh" : "300px"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          duration: 0.5
        }}
        className="relative bg-white rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <motion.div 
          className="bg-gradient-to-r from-slate-700 to-slate-800 p-6 text-white"
          layout
        >
          <div className="flex justify-between items-start">
            <motion.div 
              className="flex items-center gap-3"
              layout
            >
              <Calendar className="h-6 w-6" />
              <div>
                <motion.h2 
                  className="text-xl font-bold"
                  layout
                >
                  Shift Assignments
                </motion.h2>
                <motion.p 
                  className="text-slate-300"
                  layout
                >
                  {formatDate(selectedDate)}
                </motion.p>
              </div>
            </motion.div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={isExpanded ? handleCollapse : handleExpand}
              >
                {isExpanded ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          className="p-6 overflow-y-auto"
          style={{ 
            height: isExpanded ? "calc(80vh - 120px)" : "calc(300px - 120px)"
          }}
          layout
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">Loading Assignments</h3>
                <p className="text-slate-500">Please wait while we fetch the data...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <div className="h-12 w-12 text-red-500 mx-auto mb-4">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Data</h3>
                <p className="text-slate-500">{error}</p>
              </motion.div>
            ) : Object.keys(assignmentsByShift).length === 0 ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Assignments</h3>
                <p className="text-slate-500">No shift assignments for this date.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {Object.entries(assignmentsByShift).map(([shiftName, shiftData], shiftIndex) => (
                  <motion.div 
                    key={shiftName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: shiftIndex * 0.1 }}
                    className="bg-slate-50 rounded-lg p-6 border border-slate-200"
                  >
                    {/* Shift Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Clock className="h-5 w-5 text-slate-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-slate-800">{shiftName}</h3>
                          <p className="text-sm text-slate-600">
                            {getShiftTime(shiftData.shift)}
                          </p>
                          {shiftData.shift?.description && (
                            <p className="text-xs text-slate-500 mt-1">
                              {shiftData.shift.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-slate-100 text-slate-800">
                          {shiftData.assignments.length} Staff
                        </Badge>
                      </div>
                    </div>

                    {/* Staff List */}
                    <div className="grid gap-3">
                      {shiftData.assignments.map((assignment, index) => (
                        <motion.div 
                          key={`${assignment.userId}-${assignment.shiftId}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (shiftIndex * 0.1) + (index * 0.05) }}
                          className={`rounded-lg p-4 border transition-all hover:shadow-md ${
                            assignment.isMedicalStaff 
                              ? 'bg-rose-50 border-rose-200' 
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="border-2 border-white">
                                <AvatarFallback className={`${
                                  assignment.isMedicalStaff 
                                    ? 'bg-rose-100 text-rose-600' 
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {assignment.staffInfo?.name?.[0] || assignment.userId.toString()[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-medium text-slate-800">
                                  {assignment.staffInfo?.name || `User ${assignment.userId}`}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {assignment.isMedicalStaff ? 'Medical Staff' : 'Staff'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3" />
                                    {getAssignmentCount(assignment.userId)} assignments
                                  </span>
                                  {assignment.isMedicalStaff && assignment.staffInfo?.yearsOfExperience && (
                                    <span className="flex items-center gap-1">
                                      <Award className="h-3 w-3" />
                                      {assignment.staffInfo.yearsOfExperience} years exp
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                  Assignment ID: {assignment.assignmentId}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="bg-slate-50 px-6 py-4 border-t border-slate-200"
          layout
        >
          <div className="flex justify-between items-center text-sm text-slate-600">
            <span>Total: {assignments.length} assignments</span>
            <span>{Object.keys(assignmentsByShift).length} shifts</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
} 