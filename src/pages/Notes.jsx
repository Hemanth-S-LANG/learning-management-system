import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Notes() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [myNotes, setMyNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

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

  const fetchNotes = async (courseId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notes/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setMyNotes(data.myNotes);
      setSharedNotes(data.sharedNotes);
    } catch (error) {
      console.error('Failed to load notes');
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

      if (editingNote) {
        // Update existing note
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

        if (!response.ok) throw new Error('Failed to update note');
      } else {
        // Create new note
        const response = await fetch('http://localhost:3000/api/notes/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: noteTitle,
            content: noteContent,
            courseId: selectedCourse._id,
            attachments
          })
        });

        if (!response.ok) throw new Error('Failed to create note');
      }

      closeCreateModal();
      fetchNotes(selectedCourse._id);
    } catch (error) {
      alert(error.message);
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
        <h2>My Notes</h2>
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

      {enrolledCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>
            You haven't enrolled in any courses yet.
          </p>
        </div>
      ) : !selectedCourse ? (
        <div>
          <h3>Select a Course</h3>
          <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
            {enrolledCourses.map(course => (
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
              + Create Note
            </button>
          </div>

          {/* My Notes */}
          <div style={{ marginBottom: '40px' }}>
            <h4>My Notes ({myNotes.length})</h4>
            {myNotes.length === 0 ? (
              <p style={{ color: '#666' }}>No notes yet. Create your first note!</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                {myNotes.map(note => (
                  <div key={note._id} style={{
                    border: '1px solid #ddd',
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: 'white'
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
                                    backgroundColor: '#e3f2fd',
                                    border: '1px solid #2196f3',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    color: '#1976d2'
                                  }}
                                >
                                  📎 {attachment.fileName}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#999' }}>
                          Created: {new Date(note.createdAt).toLocaleString()}
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

          {/* Shared Notes */}
          {sharedNotes.length > 0 ? (
            <div>
              <h4>Notes from Your Assigned Teachers ({sharedNotes.length})</h4>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffc107',
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#856404' }}>
                  📚 These notes are from teachers who are assigned to teach you this course.
                </p>
              </div>
              <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
                {sharedNotes.map(note => (
                  <div key={note._id} style={{
                    border: '2px solid #ffc107',
                    padding: '20px',
                    borderRadius: '8px',
                    backgroundColor: '#fffbf0'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '10px',
                      paddingBottom: '10px',
                      borderBottom: '1px solid #ffc107'
                    }}>
                      <h5 style={{ margin: 0 }}>{note.title}</h5>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: '#ffc107',
                        color: '#000',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {note.author?.profilePhoto ? (
                          <img 
                            src={note.author.profilePhoto} 
                            alt={note.author.name || note.author.username}
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid #000'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            border: '2px solid #000'
                          }}>
                            {note.author?.username?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>👨‍🏫 {note.author?.name || note.author?.username}</span>
                      </div>
                    </div>
                    <p style={{ margin: '0 0 10px 0', whiteSpace: 'pre-wrap' }}>{note.content}</p>
                    {note.attachments && note.attachments.length > 0 && (
                      <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                        <strong style={{ fontSize: '14px' }}>Attachments:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                          {note.attachments.map((attachment, idx) => (
                            <button
                              key={idx}
                              onClick={() => downloadAttachment(attachment)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#fff3cd',
                                border: '1px solid #ffc107',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: '#856404'
                              }}
                            >
                              📎 {attachment.fileName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#666' }}>
                      📅 Uploaded: {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ 
              padding: '30px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              textAlign: 'center',
              marginTop: '20px'
            }}>
              <p style={{ margin: 0, color: '#666' }}>
                No teacher notes available yet. Your assigned teachers haven't uploaded any notes for this course.
              </p>
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
            width: '90%'
          }}>
            <h3 style={{ marginTop: 0 }}>{editingNote ? 'Edit Note' : 'Create New Note'}</h3>

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
                {editingNote ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
