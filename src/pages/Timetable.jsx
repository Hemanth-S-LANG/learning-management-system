import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Timetable() {
  const [assignments, setAssignments] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = [
    { time: '08:00 - 09:00', type: 'class' },
    { time: '09:00 - 10:00', type: 'class' },
    { time: '10:00 - 10:20', type: 'break', label: '☕ Short Break', duration: '20 min' },
    { time: '10:20 - 11:20', type: 'class' },
    { time: '11:20 - 12:20', type: 'class' },
    { time: '12:20 - 13:10', type: 'break', label: '🍽️ Lunch Break', duration: '50 min' },
    { time: '13:10 - 14:10', type: 'class' },
    { time: '14:10 - 15:10', type: 'class' },
    { time: '15:10 - 16:10', type: 'class' },
    { time: '16:10 - 17:10', type: 'class' }
  ];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchTimetable();
  }, [token, navigate]);

  const fetchTimetable = async () => {
    try {
      // Fetch teacher assignments
      const assignmentRes = await fetch('http://localhost:3000/api/courses/my-timetable', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const assignmentData = await assignmentRes.json();
      
      // Fetch enrolled courses
      const coursesRes = await fetch('http://localhost:3000/api/courses/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const coursesData = await coursesRes.json();
      
      // Ensure data is arrays
      const validAssignments = Array.isArray(assignmentData) ? assignmentData : [];
      const validCourses = Array.isArray(coursesData) ? coursesData : [];
      
      setEnrolledCourses(validCourses);
      
      // Auto-generate timetable for enrolled courses without teacher assignments
      if (validAssignments.length === 0 && validCourses.length > 0) {
        generateAutoTimetable(validCourses);
      } else {
        setAssignments(validAssignments);
      }
    } catch (error) {
      console.error('Failed to load timetable:', error);
      setAssignments([]);
      setEnrolledCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const generateAutoTimetable = (courses) => {
    const autoSchedule = [];
    let dayIndex = 0;
    let timeIndex = 0;
    
    // Filter only class slots (not breaks)
    const classSlots = timeSlots.filter(slot => slot.type === 'class');

    courses.forEach((course) => {
      autoSchedule.push({
        _id: `auto-${course._id}`,
        course: course,
        teacher: course.teacher || null,
        dayOfWeek: daysOfWeek[dayIndex],
        timeSlot: classSlots[timeIndex].time,
        isAuto: true
      });

      timeIndex++;
      if (timeIndex >= classSlots.length) {
        timeIndex = 0;
        dayIndex++;
        if (dayIndex >= daysOfWeek.length) {
          dayIndex = 0;
        }
      }
    });

    setAssignments(autoSchedule);
  };

  const getAssignmentForSlot = (day, time) => {
    return assignments.find(a => a.dayOfWeek === day && a.timeSlot === time);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #f0fdf4, #ccfbf1)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', border: '4px solid #10b981', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#4b5563', fontSize: '18px' }}>Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">📅 My Weekly Timetable</h1>
              <p className="text-gray-600">Your class schedule at a glance</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {assignments.length === 0 && enrolledCourses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Courses Enrolled</h3>
            <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
            <button
              onClick={() => navigate('/courses')}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 border border-blue-400 font-bold text-left min-w-[120px] sticky left-0 z-10">
                      ⏰ Time
                    </th>
                    {daysOfWeek.map(day => (
                      <th key={day} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 border border-blue-400 font-bold min-w-[180px]">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, idx) => {
                    // If it's a break, render special break row
                    if (slot.type === 'break') {
                      return (
                        <tr key={slot.time} className="bg-gradient-to-r from-green-50 to-emerald-50">
                          <td className="p-3 border border-green-200 font-semibold text-sm text-green-700 bg-green-100 sticky left-0 z-10">
                            {slot.time}
                          </td>
                          <td colSpan={daysOfWeek.length} className="p-4 border border-green-200 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <span className="text-2xl">{slot.label.split(' ')[0]}</span>
                              <div>
                                <div className="font-bold text-green-700 text-lg">{slot.label}</div>
                                <div className="text-green-600 text-sm">Duration: {slot.duration}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    }

                    // Regular class slot
                    return (
                      <tr key={slot.time} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="p-3 border border-gray-200 font-semibold text-sm text-gray-700 bg-blue-50 sticky left-0 z-10">
                          {slot.time}
                        </td>
                        {daysOfWeek.map(day => {
                          const assignment = getAssignmentForSlot(day, slot.time);
                          return (
                            <td key={`${day}-${slot.time}`} className={`p-2 border border-gray-200 align-top ${
                              assignment ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : ''
                            }`}>
                              {assignment ? (
                                <div className={`p-3 rounded-lg bg-white shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200 ${
                                  assignment.isAuto ? 'border-orange-400' : 'border-blue-500'
                                }`}>
                                  <div className={`font-bold mb-1 text-sm ${
                                    assignment.isAuto ? 'text-orange-600' : 'text-blue-600'
                                  }`}>
                                    {assignment.course?.code}
                                  </div>
                                  <div className="text-gray-800 text-xs mb-2 font-medium">
                                    {assignment.course?.name}
                                  </div>
                                  {assignment.teacher ? (
                                    <div className="flex items-center gap-2 pt-2 border-t border-blue-100">
                                      {assignment.teacher.profilePhoto ? (
                                        <img 
                                          src={assignment.teacher.profilePhoto} 
                                          alt={assignment.teacher.name || assignment.teacher.username}
                                          className="w-6 h-6 rounded-full object-cover border-2 border-blue-400"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                          {assignment.teacher.username?.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <span className="text-gray-600 text-xs">
                                        {assignment.teacher.name || assignment.teacher.username}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="pt-2 border-t border-orange-100">
                                      <span className="text-orange-600 text-xs italic">
                                        No teacher assigned yet
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-gray-300 text-xs text-center py-4">-</div>
                              )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        {assignments.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">📚 Legend</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border-l-4 border-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Teacher Assigned Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border-l-4 border-orange-400 rounded"></div>
                <span className="text-sm text-gray-600">Auto-Scheduled (No Teacher Yet)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-white border border-gray-200 rounded"></div>
                <span className="text-sm text-gray-600">Free Period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded"></div>
                <span className="text-sm text-gray-600">Break Time</span>
              </div>
            </div>
            {assignments.some(a => a.isAuto) && (
              <div className="mt-4 p-3 bg-orange-50 border-l-4 border-orange-400 rounded">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Orange-bordered classes are auto-scheduled based on your enrolled courses. 
                  Teachers will assign specific times when they select you for their courses.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
