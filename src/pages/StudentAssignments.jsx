import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentAssignments() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [answer, setAnswer] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchEnrolledCourses();
  }, [token, navigate]);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/courses/my-courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setEnrolledCourses(data);
    } catch (error) {
      console.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/assignments/student/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Failed to load assignments');
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

  const openSubmitModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmitModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!answer.trim()) {
        alert('Please write your answer');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/assignments/submit/${selectedAssignment._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answer, attachments })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setShowSubmitModal(false);
      setAnswer('');
      setAttachments([]);
      fetchAssignments(selectedCourse._id);
      alert('Homework submitted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>My Homework</h2>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>

      {enrolledCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>You haven't enrolled in any courses yet.</p>
        </div>
      ) : !selectedCourse ? (
        <div>
          <h3>Select a Course</h3>
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {enrolledCourses.map(course => (
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
          </div>

          <h4>Homework Assignments ({assignments.length})</h4>
          {assignments.length === 0 ? (
            <p style={{ color: '#666' }}>No homework assigned yet.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
              {assignments.map(assignment => {
                const isExpired = new Date(assignment.deadline) < new Date();
                const isSubmitted = assignment.submitted;
                
                return (
                  <div key={assignment._id} style={{ 
                    border: `2px solid ${isSubmitted ? '#28a745' : isExpired ? '#dc3545' : '#17a2b8'}`, 
                    padding: '20px', 
                    borderRadius: '8px', 
                    backgroundColor: isSubmitted ? '#d4edda' : isExpired ? '#f8d7da' : '#e7f7f9' 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <h5 style={{ margin: 0 }}>{assignment.title}</h5>
                          {isSubmitted && (
                            <span style={{ padding: '4px 12px', backgroundColor: '#28a745', color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                              ✓ SUBMITTED
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '5px 0', fontSize: '14px' }}><strong>Description:</strong> {assignment.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px 0' }}>
                          <strong style={{ fontSize: '14px' }}>Teacher:</strong>
                          {assignment.teacher?.profilePhoto ? (
                            <img 
                              src={assignment.teacher.profilePhoto} 
                              alt={assignment.teacher.name || assignment.teacher.username}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #007bff'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#6c757d',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              border: '2px solid #007bff'
                            }}>
                              {assignment.teacher?.username?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontSize: '14px' }}>{assignment.teacher?.name || assignment.teacher?.username}</span>
                        </div>
                        
                        {assignment.type === 'quiz' ? (
                          <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
                              <span style={{ padding: '4px 12px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                                QUIZ
                              </span>
                              <span style={{ fontSize: '14px', color: '#666' }}>
                                {Array.isArray(assignment.questions) ? assignment.questions.length : 0} Questions | {assignment.totalTime} minutes
                              </span>
                            </div>
                            {!assignment.allowTabSwitch && (
                              <p style={{ margin: '5px 0', fontSize: '12px', color: '#dc3545' }}>
                                ⚠️ Tab switching not allowed - stay on this page during the quiz
                              </p>
                            )}
                          </>
                        ) : (
                          <p style={{ margin: '10px 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                            <strong>Questions:</strong><br/>{typeof assignment.questions === 'string' ? assignment.questions : 'Homework assignment'}
                          </p>
                        )}
                        {assignment.attachments && assignment.attachments.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <strong style={{ fontSize: '14px' }}>Attachments:</strong>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                              {assignment.attachments.map((att, idx) => (
                                <button key={idx} onClick={() => downloadAttachment(att)} style={{ padding: '4px 8px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                                  📎 {att.fileName}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <p style={{ margin: '15px 0 0 0', fontSize: '14px', color: isExpired ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                          📅 Deadline: {new Date(assignment.deadline).toLocaleString()}
                          {isExpired && ' (Expired)'}
                        </p>
                        {isSubmitted && assignment.submission && (
                          <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'white', borderRadius: '4px', border: '1px solid #28a745' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>
                              Your Submission:
                            </p>
                            
                            {assignment.submission.score !== undefined ? (
                              /* Quiz submission */
                              <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                  <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff' }}>{assignment.submission.score.toFixed(1)}%</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>Score</div>
                                  </div>
                                  <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>{assignment.submission.accuracy.toFixed(1)}%</div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>Accuracy</div>
                                  </div>
                                  <div style={{ textAlign: 'center', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#17a2b8' }}>
                                      {Math.floor(assignment.submission.totalTimeTaken / 60)}:{(assignment.submission.totalTimeTaken % 60).toString().padStart(2, '0')}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#666' }}>Time</div>
                                  </div>
                                </div>
                                {assignment.submission.tabSwitches > 0 && (
                                  <p style={{ margin: '5px 0', fontSize: '12px', color: '#dc3545' }}>
                                    ⚠️ Tab switches: {assignment.submission.tabSwitches}
                                  </p>
                                )}
                              </>
                            ) : (
                              /* Regular homework submission */
                              null
                            )}
                            
                            <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                              Submitted: {new Date(assignment.submission.submittedAt).toLocaleString()}
                            </p>
                            <p style={{ margin: '5px 0', fontSize: '12px' }}>
                              Status: <span style={{ color: assignment.submission.status === 'late' ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                                {assignment.submission.status === 'late' ? 'LATE' : 'ON TIME'}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                      {!isSubmitted && (
                        assignment.type === 'quiz' ? (
                          <button 
                            onClick={() => navigate(`/take-quiz/${assignment._id}`)} 
                            disabled={isExpired} 
                            style={{ 
                              padding: '10px 20px', 
                              backgroundColor: isExpired ? '#6c757d' : '#17a2b8', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: isExpired ? 'not-allowed' : 'pointer', 
                              fontSize: '14px', 
                              opacity: isExpired ? 0.6 : 1,
                              fontWeight: 'bold'
                            }}
                          >
                            {isExpired ? 'Expired' : '▶ Take Quiz'}
                          </button>
                        ) : (
                          <button 
                            onClick={() => openSubmitModal(assignment)} 
                            disabled={isExpired} 
                            style={{ 
                              padding: '10px 20px', 
                              backgroundColor: isExpired ? '#6c757d' : '#28a745', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: isExpired ? 'not-allowed' : 'pointer', 
                              fontSize: '14px', 
                              opacity: isExpired ? 0.6 : 1 
                            }}
                          >
                            {isExpired ? 'Expired' : 'Submit'}
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
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0 }}>Submit Homework: {selectedAssignment?.title}</h3>
            <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px', whiteSpace: 'pre-wrap' }}><strong>Questions:</strong><br/>{selectedAssignment?.questions}</p>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Deadline: {new Date(selectedAssignment?.deadline).toLocaleString()}</p>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Your Answer:</label>
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Write your answer here..." rows="10" style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }} />
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
              <button onClick={() => { setShowSubmitModal(false); setAnswer(''); setAttachments([]); }} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSubmit} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Submit Homework
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
