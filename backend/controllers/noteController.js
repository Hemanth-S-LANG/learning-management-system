import Note from '../models/Note.js';

export const createNote = async (req, res) => {
  try {
    const { title, content, courseId, attachments, isShared } = req.body;

    console.log('Creating note:', { title, courseId, isShared, authorId: req.user.id });

    if (!title || !content || !courseId) {
      return res.status(400).json({ message: 'Title, content, and course are required' });
    }

    const note = await Note.create({
      title,
      content,
      courseId,
      author: req.user.id,
      attachments: attachments || [],
      isShared: isShared || false
    });

    console.log('Note created successfully:', note._id);
    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Failed to create note', error: error.message });
  }
};

export const getMyNotes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const Enrollment = (await import('../models/Enrollment.js')).default;
    const TeacherAssignment = (await import('../models/TeacherAssignment.js')).default;

    console.log('Getting notes for student:', req.user.id, 'course:', courseId);

    // Get notes created by user
    const myNotes = await Note.find({ 
      author: req.user.id,
      courseId 
    }).populate('author', 'username email');

    console.log('Student personal notes:', myNotes.length);

    // Get teacher notes for this course (if student is enrolled)
    let sharedNotes = [];
    if (req.user.role === 'student') {
      // Check if student is enrolled in this course
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        courseId
      });

      console.log('Enrollment found:', !!enrollment);

      if (enrollment) {
        // Find teachers assigned to this student for this course
        const assignments = await TeacherAssignment.find({
          student: req.user.id,
          courseId
        }).populate('teacher', '_id username email');

        console.log('Teacher assignments found:', assignments.length);
        console.log('Assigned teachers:', assignments.map(a => a.teacher.username));

        // Get the teacher IDs
        const assignedTeacherIds = assignments.map(a => a.teacher._id);

        if (assignedTeacherIds.length > 0) {
          // Get notes only from assigned teachers
          sharedNotes = await Note.find({
            courseId,
            isShared: true,
            author: { $in: assignedTeacherIds }
          }).populate('author', 'username email name profilePhoto').sort({ createdAt: -1 });

          console.log('Teacher notes found:', sharedNotes.length);
        } else {
          console.log('No teachers assigned to this student for this course');
        }
      } else {
        console.log('Student not enrolled in this course');
      }
    }

    res.json({ myNotes, sharedNotes });
  } catch (error) {
    console.error('Error in getMyNotes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

export const getTeacherNotes = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log('Fetching teacher notes for:', { teacherId: req.user.id, courseId });

    // Get notes created by this teacher for this course
    const notes = await Note.find({ 
      author: req.user.id,
      courseId,
      isShared: true
    }).populate('author', 'username email').sort({ createdAt: -1 });

    console.log('Found notes:', notes.length);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching teacher notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes', error: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { title, content, attachments } = req.body;

    const note = await Note.findOne({ _id: noteId, author: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    if (attachments !== undefined) note.attachments = attachments;

    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update note' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;

    const note = await Note.findOneAndDelete({ _id: noteId, author: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

export const shareNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const { studentIds } = req.body;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can share notes' });
    }

    const note = await Note.findOne({ _id: noteId, author: req.user.id });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    note.isShared = true;
    note.sharedWith = studentIds;
    await note.save();

    res.json({ message: 'Note shared successfully', note });
  } catch (error) {
    res.status(500).json({ message: 'Failed to share note' });
  }
};
