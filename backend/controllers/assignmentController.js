import { Assignment, Submission } from '../models/Assignment.js';
import TeacherAssignment from '../models/TeacherAssignment.js';
import Enrollment from '../models/Enrollment.js';

export const createAssignment = async (req, res) => {
  try {
    const { title, description, courseId, deadline, type, questions, totalTime, allowTabSwitch, attachments } = req.body;

    if (!title || !description || !courseId || !deadline || !questions || questions.length === 0) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const assignment = await Assignment.create({
      title,
      description,
      courseId,
      teacher: req.user.id,
      deadline: new Date(deadline),
      type: type || 'quiz',
      questions,
      totalTime: totalTime || 60,
      allowTabSwitch: allowTabSwitch || false,
      attachments: attachments || []
    });

    console.log('Assignment created:', assignment._id);
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Failed to create assignment', error: error.message });
  }
};

export const getTeacherAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const assignments = await Assignment.find({
      teacher: req.user.id,
      courseId
    }).sort({ createdAt: -1 });

    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
};

export const getStudentAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log('Fetching assignments for student:', req.user.id, 'course:', courseId);

    // Check if student is enrolled
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      courseId
    });

    if (!enrollment) {
      console.log('Student not enrolled in course');
      return res.json([]);
    }

    // Get ALL assignments for this course (available to all enrolled students)
    const assignments = await Assignment.find({
      courseId
    }).populate('teacher', 'username email name profilePhoto').sort({ deadline: 1 });

    console.log('Found assignments:', assignments.length);

    // Get student's submissions
    const submissions = await Submission.find({
      student: req.user.id,
      assignment: { $in: assignments.map(a => a._id) }
    });

    console.log('Found submissions:', submissions.length);

    // Map submissions to assignments
    const assignmentsWithStatus = assignments.map(assignment => {
      const submission = submissions.find(s => s.assignment.toString() === assignment._id.toString());
      return {
        ...assignment.toObject(),
        submitted: !!submission,
        submission: submission || null
      };
    });

    res.json(assignmentsWithStatus);
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ message: 'Failed to fetch assignments' });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    console.log('Fetching assignment by ID:', assignmentId);

    const assignment = await Assignment.findById(assignmentId)
      .populate('teacher', 'username email name profilePhoto');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if student already submitted
    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user.id
    });

    if (submission) {
      return res.status(400).json({ message: 'You have already submitted this quiz' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Failed to fetch assignment' });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answers, totalTimeTaken, tabSwitches, tabSwitchTimestamps, startedAt } = req.body;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: req.user.id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Already submitted' });
    }

    // Calculate score and accuracy
    let correctAnswers = 0;
    const gradedAnswers = answers.map((ans, idx) => {
      const question = assignment.questions[ans.questionIndex];
      let isCorrect = false;

      if (question.questionType === 'mcq' || question.questionType === 'true-false') {
        isCorrect = ans.answer === question.correctAnswer;
      } else if (question.questionType === 'match-column') {
        // For match column, answer should be a JSON string of pairs
        try {
          const studentPairs = JSON.parse(ans.answer);
          isCorrect = JSON.stringify(studentPairs) === JSON.stringify(question.matchPairs);
        } catch (e) {
          isCorrect = false;
        }
      }

      if (isCorrect) correctAnswers++;

      return {
        ...ans,
        isCorrect
      };
    });

    const totalQuestions = assignment.questions.filter(q => q.questionType !== 'descriptive').length;
    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

    // Check if late
    const now = new Date();
    const status = now > assignment.deadline ? 'late' : 'on-time';

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user.id,
      answers: gradedAnswers,
      totalTimeTaken,
      score,
      accuracy,
      tabSwitches: tabSwitches || 0,
      tabSwitchTimestamps: tabSwitchTimestamps || [],
      startedAt: new Date(startedAt),
      status,
      submittedAt: now
    });

    // Prepare results with explanations for student review
    const results = gradedAnswers.map((ans, idx) => {
      const question = assignment.questions[ans.questionIndex];
      return {
        questionText: question.questionText,
        questionType: question.questionType,
        studentAnswer: ans.answer,
        correctAnswer: question.correctAnswer,
        isCorrect: ans.isCorrect,
        explanation: question.explanation || 'No explanation provided',
        timeTaken: ans.timeTaken
      };
    });

    res.status(201).json({ 
      message: 'Submitted successfully', 
      submission, 
      score, 
      accuracy,
      results // Include detailed results with explanations
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Failed to submit assignment', error: error.message });
  }
};

export const getAssignmentSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      teacher: req.user.id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'username email')
      .sort({ submittedAt: -1 });

    res.json({ assignment, submissions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findOneAndDelete({
      _id: assignmentId,
      teacher: req.user.id
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Delete all submissions
    await Submission.deleteMany({ assignment: assignmentId });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete assignment' });
  }
};
