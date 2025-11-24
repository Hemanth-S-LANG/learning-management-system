import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherAssignments() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState('');
  const [deadline, setDeadline] = useState('');
  const [attachments, setAttachments] = useState([]);
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

  const fetchAssignments = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/assignments/teacher/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments');
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/assignments/submissions/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setSelectedAssignment(data.assignment);
      setSubmissions(data.submissions);
      setShowSubmissionsModal(true);
    } catch (error) {
      console.error('Failed to load submissions');
    }
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    fetchAssignments(course._id);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachments(prev => [...prev, {
          fileName: file.name,
          fileData: event.target.result,
          fileType: file.type,
          fileSize: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const downloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.fileData;
    link.download = attachment.fileName;
    link.click();
  };

  const handleCreateAssignment = async () => {
    try {
      if (!title.trim() || !description.trim() || !questions.trim() || !deadline) {
        alert('Please fill in all fields');
        return;
      }

      const response = await fetch('http://localhost:3000/api/assignments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          questions,
          courseId: selectedCourse._id,
          deadline,
          attachments
        })
      });

      if (!response.ok) throw new Error('Failed to create assignment');

      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setQuestions('');
      setDeadline('');
      setAttachments([]);
      fetchAssignments(selectedCourse._id);
      alert('Homework posted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!confirm('Are you sure you want to delete this homework?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete');

      fetchAssignments(selectedCourse._id);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Post Homework</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>

      {!selectedCourse ? (
        <div>
          <h3>Select a Course</h3>
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {courses.map(course => (
              <div key={course._id} onClick={() => handleSelectCourse(course)} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}>
                <h4 style={{ margin: '0 0 5px 0' }}>{course.name}</h4>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>Code: {course.code}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>{selectedCourse.name}</h3>
              <button onClick={() => setSelectedCourse(null)} style={{ padding: '6px 12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                ← Back to Courses
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => navigate('/create-quiz', { state: { courseId: selectedCourse._id } })} style={{ padding: '10px 20px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                + Create Quiz/Test
              </button>
              <button onClick={() => setShowCreateModal(true)} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                + Post Homework
              </button>
            </div>
          </div>

          <h4>Posted Homework ({assignments.length})</h4>
          {assignments.length === 0 ? (
            <p style={{ color: '#666' }}>No homework posted yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
              {assignments.map(assignment => (
                <div key={assignment._id} style={{ border: '2px solid #17a2b8', padding: '20px', borderRadius: '8px', backgroundColor: '#e7f7f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <h5 style={{ margin: 0 }}>{assignment.title}</h5>
                        {assignment.type === 'quiz' && (
                          <span style={{ padding: '4px 12px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                            QUIZ
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Description:</strong> {assignment.description}</p>
                      {assignment.type === 'quiz' ? (
                        <>
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Questions:</strong> {Array.isArray(assignment.questions) ? assignment.questions.length : 0} questions
                          </p>
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Time Limit:</strong> {assignment.totalTime} minutes
                          </p>
                          <p style={{ margin: '5px 0', fontSize: '14px' }}>
                            <strong>Tab Switching:</strong> {assignment.allowTabSwitch ? 'Allowed' : 'Not Allowed'}
                          </p>
                        </>
                      ) : (
                        <p style={{ margin: '5px 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                          <strong>Questions:</strong><br/>{typeof assignment.questions === 'string' ? assignment.questions : 'Descriptive homework'}
                        </p>
                      )}
                      <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: new Date(assignment.deadline) < new Date() ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                        📅 Deadline: {new Date(assignment.deadline).toLocaleString()}
                        {new Date(assignment.deadline) < new Date() && ' (Expired)'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => fetchSubmissions(assignment._id)} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                        View Submissions
                      </button>
                      <button onClick={() => handleDeleteAssignment(assignment._id)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Post New Homework</h3>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Title:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Week 1 Assignment" style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description:</label>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Questions:</label>
              <textarea value={questions} onChange={(e) => setQuestions(e.target.value)} placeholder="Enter questions or problem statement" rows="8" style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Deadline:</label>
              <input type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd' }} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Attachments (optional):</label>
              <input type="file" multiple onChange={handleFileUpload} style={{ width: '100%', padding: '8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ddd' }} />
              {attachments.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  {attachments.map((att, idx) => (
                    <div key={idx} style={{ padding: '5px', backgroundColor: '#f8f9fa', marginBottom: '5px', borderRadius: '4px', fontSize: '12px' }}>
                      📎 {att.fileName}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => { setShowCreateModal(false); setTitle(''); setDescription(''); setQuestions(''); setDeadline(''); setAttachments([]); }} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleCreateAssignment} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Post Homework
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Submissions for: {selectedAssignment?.title}</h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>Total Submissions: {submissions.length}</p>
            {submissions.length === 0 ? (
              <p style={{ color: '#666' }}>No submissions yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {submissions.map(sub => (
                  <div key={sub._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', backgroundColor: sub.status === 'late' ? '#fff3cd' : '#d4edda' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong>{sub.student.username}</strong>
                      <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: sub.status === 'late' ? '#ffc107' : '#28a745', color: 'white' }}>
                        {sub.status === 'late' ? 'LATE' : 'ON TIME'}
                      </span>
                    </div>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Email:</strong> {sub.student.email}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Submitted:</strong> {new Date(sub.submittedAt).toLocaleString()}</p>
                    
                    {/* Quiz submission details */}
                    {sub.score !== undefined ? (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', margin: '15px 0', padding: '15px', backgroundColor: 'white', borderRadius: '4px' }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>{sub.score.toFixed(1)}%</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Score</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{sub.accuracy.toFixed(1)}%</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Accuracy</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>{Math.floor(sub.totalTimeTaken / 60)}:{(sub.totalTimeTaken % 60).toString().padStart(2, '0')}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Time Taken</div>
                          </div>
                        </div>
                        {sub.tabSwitches > 0 && (
                          <p style={{ margin: '10px 0', fontSize: '14px', color: '#dc3545', fontWeight: 'bold' }}>
                            ⚠️ Tab Switches: {sub.tabSwitches}
                          </p>
                        )}
                        <p style={{ margin: '5px 0', fontSize: '14px' }}>
                          <strong>Started:</strong> {new Date(sub.startedAt).toLocaleString()}
                        </p>
                      </>
                    ) : (
                      /* Regular homework submission */
                      <>
                        <p style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}><strong>Answer:</strong><br/>{sub.answer}</p>
                        {sub.attachments && sub.attachments.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <strong style={{ fontSize: '14px' }}>Attachments:</strong>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                              {sub.attachments.map((att, idx) => (
                                <button key={idx} onClick={() => downloadAttachment(att)} style={{ padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                  📎 {att.fileName}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => setShowSubmissionsModal(false)} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
