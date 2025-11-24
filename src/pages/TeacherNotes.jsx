import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherNotes() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [myNotes, setMyNotes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [editingNote, setEditingNote] = useState(null);
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

  const fetchNotes = async (courseId) => {
    try {
      console.log('Fetching notes for course:', courseId);
      const response = await fetch(`http://localhost:3000/api/notes/teacher/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Fetched notes:', data);
      setMyNotes(data);
    } catch (error) {
      console.error('Failed to load notes:', error);
    }
  };

  const handleSelectCourse = (course) => {
    setSelectedCourse(course);
    fetchNotes(course._id);
  };

  const openCreateModal = (note = null) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
      setAttachments(note.attachments || []);
    } else {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
      setAttachments([]);
    }
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setAttachments([]);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment = {
          fileName: file.name,
          fileData: event.target.result,
          fileType: file.type,
          fileSize: file.size
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const downloadAttachment = (attachment) => {
    const link = document.createElement('a');
    link.href = attachment.fileData;
    link.download = attachment.fileName;
    link.click();
  };

  const handleSaveNote = async () => {
    try {
      if (!noteTitle.trim() || !noteContent.trim()) {
        alert('Please fill in both title and content');
        return;
      }

      console.log('Saving note...', { 
        title: noteTitle, 
        content: noteContent, 
        courseId: selectedCourse._id,
        attachments: attachments.length 
      });

      if (editingNote) {
        const response = await fetch(`http://localhost:3000/api/notes/${editingNote._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            title: noteTitle, 
            content: noteContent,
            attachments 
          })
        });

        const data = await response.json();
        console.log('Update response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to update note');
        }
      } else {
        const response = await fetch('http://localhost:3000/api/notes/teacher/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            courseId: selectedCourse._id,
            attachments,
            isShared: true
          })
        });

        const data = await response.json();
        console.log('Create response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create note');
        }
      }

      closeCreateModal();
      await fetchNotes(selectedCourse._id);
      alert('Note saved and shared with all enrolled students!');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`http://localhost:3000/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete note');

      fetchNotes(selectedCourse._id);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>Teacher Notes</h2>
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
          <h3>Select a Course to Upload Notes</h3>
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
                  backgroundColor: 'white',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <h4 style={{ margin: '0 0 5px 0' }}>{course.name}</h4>
                <p style={{ margin: '5px 0', color: '#666', fontSize: '14px' }}>Code: {course.code}</p>
                <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>{course.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3>{selectedCourse.name}</h3>
              <button
                onClick={() => setSelectedCourse(null)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ← Back to Courses
              </button>
            </div>
            <button
              onClick={() => openCreateModal()}
              style={{
                padding: '10px 20px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              + Upload Note
            </button>
          </div>

          <div style={{ 
            padding: '15px', 
            backgroundColor: '#d1ecf1', 
            border: '1px solid #bee5eb',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: 0, color: '#0c5460' }}>
              ℹ️ Notes uploaded here will be automatically visible to all students enrolled in this course.
            </p>
          </div>

          <h4>Uploaded Notes ({myNotes.length})</h4>
          {myNotes.length === 0 ? (
            <p style={{ color: '#666' }}>No notes uploaded yet. Upload your first note!</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
              {myNotes.map(note => (
                <div key={note._id} style={{
                  border: '2px solid #28a745',
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fff9'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ margin: '0 0 10px 0' }}>{note.title}</h5>
                      <p style={{ margin: '0', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                      {note.attachments && note.attachments.length > 0 && (
                        <div style={{ marginTop: '10px' }}>
                          <strong style={{ fontSize: '14px' }}>Attachments:</strong>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                            {note.attachments.map((attachment, idx) => (
                              <button
                                key={idx}
                                onClick={() => downloadAttachment(attachment)}
                                style={{
                                  padding: '4px 8px',
                                  backgroundColor: '#d4edda',
                                  border: '1px solid #28a745',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  color: '#155724'
                                }}
                              >
                                📎 {attachment.fileName}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                        Uploaded: {new Date(note.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => openCreateModal(note)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note._id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
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

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginTop: 0 }}>{editingNote ? 'Edit Note' : 'Upload New Note'}</h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Title:
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter note title"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Content:
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter note content"
                rows="10"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '16px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Attachments:
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
              {attachments.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <strong style={{ fontSize: '14px' }}>Selected files:</strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    {attachments.map((attachment, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}>
                        <span style={{ fontSize: '14px' }}>
                          📎 {attachment.fileName} ({(attachment.fileSize / 1024).toFixed(2)} KB)
                        </span>
                        <button
                          onClick={() => removeAttachment(idx)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={closeCreateModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {editingNote ? 'Update' : 'Upload & Share'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
