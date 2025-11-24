import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Courses() {
  const [allCourses, setAllCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, [token, navigate]);

  const fetchCourses = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        fetch('http://localhost:3000/api/courses/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:3000/api/courses/my-courses', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const allData = await allRes.json();
      const myData = await myRes.json();

      setAllCourses(allData);
      setMyCourses(myData);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch('http://localhost:3000/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ courseId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUnenroll = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/courses/unenroll/${courseId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      fetchCourses();
    } catch (err) {
      alert(err.message);
    }
  };

  const isEnrolled = (courseId) => {
    return myCourses.some(c => c._id === courseId);
  };

  const fetchTeacherDetails = async (teacherId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/auth/user/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setTeacherDetails(data);
      setShowTeacherModal(true);
    } catch (err) {
      console.error('Failed to fetch teacher details:', err);
    }
  };

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleViewProfile = () => {
    if (selectedTeacher._id) {
      fetchTeacherDetails(selectedTeacher._id);
    } else {
      setTeacherDetails(selectedTeacher);
      setShowTeacherModal(true);
    }
    setSelectedTeacher(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading courses...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Available Courses</h1>
              <p className="text-gray-600">Browse and enroll in courses</p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* My Enrolled Courses */}
        {myCourses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-green-600 mb-4 flex items-center">
              <span className="bg-green-100 p-2 rounded-lg mr-3">✓</span>
              My Enrolled Courses ({myCourses.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCourses.map(course => (
                <div key={course._id} className="bg-white border-2 border-green-400 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                    <p className="text-green-50 text-sm">
                      Code: {course.code}{course.section ? `-${course.section}` : ''}
                      {course.section && <span className="ml-2 px-2 py-1 bg-white bg-opacity-30 rounded text-xs">Section {course.section}</span>}
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    
                    {course.teacher && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-2">Teacher:</p>
                        <div 
                          onClick={() => handleTeacherClick(course.teacher)}
                          className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-300 cursor-pointer hover:bg-green-100 transition-all duration-200 hover:scale-105"
                        >
                          {course.teacher.profilePhoto ? (
                            <img 
                              src={course.teacher.profilePhoto} 
                              alt={course.teacher.name || course.teacher.username}
                              className="w-10 h-10 rounded-full object-cover border-2 border-green-400"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold border-2 border-green-400">
                              {course.teacher.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-semibold text-gray-800">
                            {course.teacher.name || course.teacher.username}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => handleUnenroll(course._id)}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
                    >
                      Unenroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Available Courses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">All Available Courses</h2>
          {allCourses.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl text-gray-600">No courses available yet.</p>
              <p className="text-gray-500 mt-2">Check back later for new courses!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.map(course => {
                const enrolled = isEnrolled(course._id);
                return (
                  <div 
                    key={course._id} 
                    className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden ${
                      enrolled ? 'border-2 border-green-400' : 'border border-gray-200'
                    }`}
                  >
                    <div className={`p-4 ${
                      enrolled 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}>
                      <h3 className="text-xl font-bold text-white mb-1">{course.name}</h3>
                      <p className={`text-sm ${enrolled ? 'text-green-50' : 'text-blue-50'}`}>
                        Code: {course.code}{course.section ? `-${course.section}` : ''}
                        {course.section && <span className="ml-2 px-2 py-1 bg-white bg-opacity-30 rounded text-xs">Section {course.section}</span>}
                      </p>
                    </div>
                    
                    <div className="p-6">
                      <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                      
                      {course.teacher && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-500 mb-2">Teacher:</p>
                          <div 
                            onClick={() => handleTeacherClick(course.teacher)}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                              enrolled 
                                ? 'bg-green-50 border-green-300 hover:bg-green-100' 
                                : 'bg-blue-50 border-blue-300 hover:bg-blue-100'
                            }`}
                          >
                            {course.teacher.profilePhoto ? (
                              <img 
                                src={course.teacher.profilePhoto} 
                                alt={course.teacher.name || course.teacher.username}
                                className={`w-10 h-10 rounded-full object-cover border-2 ${
                                  enrolled ? 'border-green-400' : 'border-blue-400'
                                }`}
                              />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border-2 ${
                                enrolled 
                                  ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-400' 
                                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-400'
                              }`}>
                                {course.teacher.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="font-semibold text-gray-800">
                              {course.teacher.name || course.teacher.username}
                            </span>
                          </div>
                        </div>
                      )}

                      <p className="text-sm text-gray-500 mb-4">
                        👥 {course.students?.length || 0} students enrolled
                      </p>
                      
                      {user.role === 'student' && (
                        enrolled ? (
                          <button
                            onClick={() => handleUnenroll(course._id)}
                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
                          >
                            Unenroll
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnroll(course._id)}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
                          >
                            Enroll Now
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Teacher Selection Popup */}
        {selectedTeacher && (
          <div 
            onClick={() => setSelectedTeacher(null)}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all"
            >
              <div className="text-center mb-6">
                {selectedTeacher.profilePhoto ? (
                  <img 
                    src={selectedTeacher.profilePhoto} 
                    alt={selectedTeacher.name || selectedTeacher.username}
                    className="w-24 h-24 rounded-full object-cover border-4 border-green-400 mx-auto shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white text-4xl font-bold mx-auto border-4 border-green-400 shadow-lg">
                    {selectedTeacher.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
                {selectedTeacher.name || selectedTeacher.username}
              </h3>

              <div className="flex gap-3">
                <button
                  onClick={handleViewProfile}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
                >
                  View Profile
                </button>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teacher Profile Modal */}
        {showTeacherModal && teacherDetails && (
          <div 
            onClick={() => setShowTeacherModal(false)}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-10 transform transition-all"
            >
              <div className="text-center mb-6">
                {teacherDetails.profilePhoto ? (
                  <img 
                    src={teacherDetails.profilePhoto} 
                    alt={teacherDetails.name || teacherDetails.username}
                    className="w-48 h-48 rounded-full object-cover border-6 border-green-500 mx-auto shadow-2xl"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center text-white text-6xl font-bold mx-auto border-6 border-green-500 shadow-2xl">
                    {teacherDetails.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-bold text-gray-800 text-center mb-3">
                {teacherDetails.name || teacherDetails.username}
              </h2>
              
              <div className="inline-block px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-semibold mb-6 mx-auto block w-fit">
                👨‍🏫 TEACHER
              </div>

              {teacherDetails.email && (
                <p className="text-center text-gray-600 mb-8 text-lg">
                  📧 {teacherDetails.email}
                </p>
              )}

              <button
                onClick={() => setShowTeacherModal(false)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
