import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import ThemeSelector from '../components/ThemeSelector';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: theme.background }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl shadow-lg p-6 mb-6" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: '1px' }}>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: theme.text }}>Dashboard</h1>
              <p style={{ color: theme.text, opacity: 0.7 }}>Welcome back, {user.username}!</p>
            </div>
            <ThemeSelector />
          </div>
        </div>

        {/* User Info Card */}
        <div className="rounded-2xl shadow-lg p-6 mb-6" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: '1px' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text }}>Profile Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, borderWidth: '1px' }}>
              <p className="text-sm mb-1" style={{ color: theme.text, opacity: 0.7 }}>Username</p>
              <p className="text-lg font-semibold" style={{ color: theme.text }}>{user.username}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, borderWidth: '1px' }}>
              <p className="text-sm mb-1" style={{ color: theme.text, opacity: 0.7 }}>Email</p>
              <p className="text-lg font-semibold" style={{ color: theme.text }}>{user.email}</p>
            </div>
            <div className="p-4 rounded-xl" style={{ backgroundColor: theme.inputBg, borderColor: theme.inputBorder, borderWidth: '1px' }}>
              <p className="text-sm mb-1" style={{ color: theme.text, opacity: 0.7 }}>Role</p>
              <span className="inline-block px-4 py-2 rounded-lg font-semibold text-white" style={{ backgroundColor: user.role === 'teacher' ? theme.primary : theme.success }}>
                {user.role === 'teacher' ? '👨‍🏫 Teacher' : '🎓 Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: theme.cardBg, borderColor: theme.cardBorder, borderWidth: '1px' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: theme.text }}>Quick Actions</h2>
          
          {user.role === 'student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/courses')}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.primary }}
              >
                <div className="text-4xl mb-2">📚</div>
                <h3 className="text-lg font-semibold">View Courses</h3>
                <p className="text-sm opacity-90 mt-1">Browse and enroll</p>
              </button>

              <button
                onClick={() => navigate('/timetable')}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.success }}
              >
                <div className="text-4xl mb-2">📅</div>
                <h3 className="text-lg font-semibold">My Timetable</h3>
                <p className="text-sm opacity-90 mt-1">View schedule</p>
              </button>

              <button
                onClick={() => navigate('/notes')}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.warning }}
              >
                <div className="text-4xl mb-2">📝</div>
                <h3 className="text-lg font-semibold">My Notes</h3>
                <p className="text-sm opacity-90 mt-1">Study materials</p>
              </button>

              <button
                onClick={() => navigate('/student-assignments')}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.info }}
              >
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-lg font-semibold">My Homework</h3>
                <p className="text-sm opacity-90 mt-1">Assignments & quizzes</p>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.secondary }}
              >
                <div className="text-4xl mb-2">👤</div>
                <h3 className="text-lg font-semibold">My Profile</h3>
                <p className="text-sm opacity-90 mt-1">Edit profile</p>
              </button>

              <button
                onClick={handleLogout}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.danger }}
              >
                <div className="text-4xl mb-2">🚪</div>
                <h3 className="text-lg font-semibold">Logout</h3>
                <p className="text-sm opacity-90 mt-1">Sign out</p>
              </button>
            </div>
          )}

          {user.role === 'teacher' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/teacher-courses')}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.primary }}
              >
                <div className="text-4xl mb-2">📚</div>
                <h3 className="text-lg font-semibold">Manage Courses</h3>
                <p className="text-sm opacity-90 mt-1">Create & edit courses</p>
              </button>

              <button
                onClick={() => navigate('/teacher-notes')}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.warning }}
              >
                <div className="text-4xl mb-2">📝</div>
                <h3 className="text-lg font-semibold">Upload Notes</h3>
                <p className="text-sm opacity-90 mt-1">Share materials</p>
              </button>

              <button
                onClick={() => navigate('/teacher-assignments')}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.info }}
              >
                <div className="text-4xl mb-2">📋</div>
                <h3 className="text-lg font-semibold">Post Homework</h3>
                <p className="text-sm opacity-90 mt-1">Create assignments</p>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.secondary }}
              >
                <div className="text-4xl mb-2">👤</div>
                <h3 className="text-lg font-semibold">My Profile</h3>
                <p className="text-sm opacity-90 mt-1">Edit profile</p>
              </button>

              <button
                onClick={handleLogout}
                className="group text-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                style={{ backgroundColor: theme.danger }}
              >
                <div className="text-4xl mb-2">🚪</div>
                <h3 className="text-lg font-semibold">Logout</h3>
                <p className="text-sm opacity-90 mt-1">Sign out</p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
