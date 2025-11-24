import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherCourses() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCourses();
  }, [token, navigate]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:3000/api/courses/students/${course._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      setStudents(data.students);
      setAssignments(data.assignments);
    } catch (error) {
      console.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (studentId) => {
    try {
      const response = await fetch('http://localhost:3000/api/courses/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          studentId, 
          courseId: selectedCourse._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setAssignments([...assignments, studentId]);
      handleSelectCourse(selectedCourse); // Refresh the student list
      alert(data.message);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUnassign = async (studentId) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/courses/unassign/${selectedCourse._id}/${studentId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      setAssignments(assignments.filter(id => id !== studentId));
    } catch (error) {
      alert(error.message);
    }
  };

  const isAssigned = (studentId) => assignments.includes(studentId);

  if (loading && !selectedCourse) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Teacher Dashboard</h2>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Dashboard
        </button>
      </div>

      {!selectedCourse ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>My Courses</h3>
            <button
              onClick={() => {
                const name = prompt('Enter course name (e.g., Introduction to Programming):');
                if (!name) return;
                const code = prompt('Enter course code (e.g., CS101):');
                if (!code) return;
                const description = prompt('Enter course description:');
                if (!description) return;
                
                fetch('http://localhost:3000/api/courses/create', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                  },
                  body: JSON.stringify({ name, code, description })
                })
                .then(res => res.json())
                .then(data => {
                  if (data._id) {
                    alert(`Course created successfully as ${data.code}-${data.section}!`);
                    fetchCourses();
                  } else {
                    alert(data.message || 'Failed to create course');
                  }
                })
                .catch(err => alert('Error creating course'));
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + Create New Course
            </button>
          </div>
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {courses.map(course => (
              <div
                key={course._id}
                onClick={() => handleSelectCourse(course)}
                style={{
                  border: '1px solid #ddd',
                  padding: '20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <h4 style={{ margin: '0 0 5px 0' }}>{course.name}</h4>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>
                  Code: {course.code}{course.section ? `-${course.section}` : ''} 
                  {course.section && <span style={{ marginLeft: '10px', padding: '2px 8px', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', fontSize: '12px' }}>Section {course.section}</span>}
                </p>
                <p style={{ margin: '10px 0' }}>{course.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>{selectedCourse.name} ({selectedCourse.code})</h3>
              <p style={{ color: '#666' }}>{selectedCourse.description}</p>
            </div>
            <button
              onClick={() => {
                setSelectedCourse(null);
                setStudents([]);
                setAssignments([]);
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Courses
            </button>
          </div>

          <h4>Enrolled Students ({students.length})</h4>
          {students.length === 0 ? (
            <p style={{ color: '#666', marginTop: '20px' }}>No students enrolled in this course yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
              {students.map(student => (
                <div
                  key={student._id}
                  style={{
                    border: isAssigned(student._id) ? '2px solid #28a745' : '1px solid #ddd',
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: isAssigned(student._id) ? '#f8fff9' : 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <h5 style={{ margin: '0 0 5px 0' }}>{student.username}</h5>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{student.email}</p>
                    {isAssigned(student._id) && (
                      <span style={{
                        display: 'inline-block',
                        marginTop: '8px',
                        padding: '4px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        Assigned to You
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => isAssigned(student._id) ? handleUnassign(student._id) : handleAssign(student._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: isAssigned(student._id) ? '#dc3545' : '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {isAssigned(student._id) ? 'Unassign' : 'Assign to Me'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
