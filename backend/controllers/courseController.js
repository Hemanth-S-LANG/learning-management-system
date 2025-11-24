import Course from '../models/Course.js';

// No hardcoded courses - only show courses created by real registered teachers

export const getAllCourses = async (req, res) => {
  try {
    const dbCourses = await Course.find().populate('teacher', 'username email name profilePhoto');
    res.json(dbCourses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    // Get only real DB courses that student is enrolled in
    const dbCourses = await Course.find({ students: req.user.id }).populate('teacher', 'username email name profilePhoto');
    
    res.json(dbCourses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your courses' });
  }
};

export const enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const Enrollment = (await import('../models/Enrollment.js')).default;

    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can enroll in courses' });
    }

    // Handle only real DB courses
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    course.students.push(req.user.id);
    await course.save();

    // Also store in Enrollment collection for consistency
    await Enrollment.create({
      student: req.user.id,
      courseId
    });

    res.json({ message: 'Enrolled successfully', course });
  } catch (error) {
    res.status(500).json({ message: 'Enrollment failed' });
  }
};

export const unenrollCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const Enrollment = (await import('../models/Enrollment.js')).default;

    // Remove from Enrollment collection
    await Enrollment.deleteOne({
      student: req.user.id,
      courseId
    });

    // Handle only real DB courses
    const course = await Course.findById(courseId);
    if (course) {
      course.students = course.students.filter(id => id.toString() !== req.user.id.toString());
      await course.save();
    }

    res.json({ message: 'Unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unenrollment failed' });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { name, code, description, section } = req.body;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can create courses' });
    }

    if (!name || !code || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Auto-generate section if not provided
    let courseSection = section || 'A';
    
    // Check if this code+section combination exists
    const existingCourse = await Course.findOne({ code, section: courseSection });
    if (existingCourse) {
      // Find next available section
      const existingSections = await Course.find({ code }).select('section');
      const usedSections = existingSections.map(c => c.section);
      
      // Generate next section letter
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (let letter of alphabet) {
        if (!usedSections.includes(letter)) {
          courseSection = letter;
          break;
        }
      }
    }

    const course = await Course.create({
      name,
      code,
      section: courseSection,
      description,
      teacher: req.user.id
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Failed to create course' });
  }
};

import User from '../models/User.js';
import TeacherAssignment from '../models/TeacherAssignment.js';

export const getEnrolledStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const Enrollment = (await import('../models/Enrollment.js')).default;

    // Get all enrollments for this course
    const enrollments = await Enrollment.find({ courseId }).populate('student', 'username email');
    const enrolledStudents = enrollments.map(e => e.student);
    
    // Get teacher assignments for this course
    const assignments = await TeacherAssignment.find({ 
      courseId,
      teacher: req.user.id 
    }).populate('student', 'username email name profilePhoto');

    res.json({ 
      students: enrolledStudents,
      assignments: assignments.map(a => a.student._id.toString())
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

export const assignTeacherToStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can assign themselves' });
    }

    // Check if assignment already exists for this course
    const existing = await TeacherAssignment.findOne({
      teacher: req.user.id,
      student: studentId,
      courseId
    });

    if (existing) {
      return res.status(400).json({ message: 'Already assigned to this student for this course' });
    }

    // Get all existing assignments for this student
    const existingAssignments = await TeacherAssignment.find({ student: studentId });
    
    // Create a set of occupied time slots
    const occupiedSlots = new Set();
    existingAssignments.forEach(assignment => {
      occupiedSlots.add(`${assignment.dayOfWeek}-${assignment.timeSlot}`);
    });

    // Define available days and time slots
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      '08:00 - 09:00',
      '09:00 - 10:00',
      '10:00 - 11:00',
      '11:00 - 12:00',
      '12:00 - 13:00',
      '13:00 - 14:00',
      '14:00 - 15:00',
      '15:00 - 16:00',
      '16:00 - 17:00',
      '17:00 - 18:00'
    ];

    // Find an available slot
    let selectedDay = null;
    let selectedTime = null;

    for (const day of daysOfWeek) {
      for (const time of timeSlots) {
        const slotKey = `${day}-${time}`;
        if (!occupiedSlots.has(slotKey)) {
          selectedDay = day;
          selectedTime = time;
          break;
        }
      }
      if (selectedDay) break;
    }

    if (!selectedDay || !selectedTime) {
      return res.status(400).json({ message: 'No available time slots. Student schedule is full.' });
    }

    const assignment = await TeacherAssignment.create({
      teacher: req.user.id,
      student: studentId,
      courseId,
      dayOfWeek: selectedDay,
      timeSlot: selectedTime
    });

    res.json({ 
      message: `Assigned successfully to ${selectedDay} at ${selectedTime}`, 
      assignment,
      dayOfWeek: selectedDay,
      timeSlot: selectedTime
    });
  } catch (error) {
    res.status(500).json({ message: 'Assignment failed' });
  }
};

export const unassignTeacherFromStudent = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    await TeacherAssignment.deleteOne({
      teacher: req.user.id,
      student: studentId,
      courseId
    });

    res.json({ message: 'Unassigned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unassignment failed' });
  }
};

export const getMyTimetable = async (req, res) => {
  try {
    const assignments = await TeacherAssignment.find({ student: req.user.id })
      .populate('teacher', 'username email name profilePhoto')
      .sort({ createdAt: -1 });

    // Get course details for each assignment from real DB courses only
    const timetable = await Promise.all(assignments.map(async (assignment) => {
      const course = await Course.findById(assignment.courseId);
      
      return {
        _id: assignment._id,
        teacher: assignment.teacher,
        course: course || { name: 'Unknown Course', code: 'N/A', description: '' },
        dayOfWeek: assignment.dayOfWeek,
        timeSlot: assignment.timeSlot,
        createdAt: assignment.createdAt
      };
    }));

    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch timetable' });
  }
};
