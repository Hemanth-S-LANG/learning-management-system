import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'descriptive'],
    default: 'descriptive'
  },
  questions: [{
    questionText: String,
    questionType: {
      type: String,
      enum: ['mcq', 'true-false', 'match-column', 'descriptive']
    },
    options: [String],
    correctAnswer: String,
    explanation: String, // Teacher's explanation for the correct answer
    matchPairs: [{
      left: String,
      right: String
    }],
    points: {
      type: Number,
      default: 1
    },
    timeLimit: Number // in seconds
  }],
  totalTime: Number, // total time limit in minutes
  allowTabSwitch: {
    type: Boolean,
    default: false
  },
  attachments: [{
    fileName: String,
    fileData: String,
    fileType: String,
    fileSize: Number
  }]
}, { timestamps: true });

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: Number,
    answer: String,
    timeTaken: Number, // seconds
    isCorrect: Boolean
  }],
  totalTimeTaken: Number, // total seconds
  score: Number,
  accuracy: Number, // percentage
  tabSwitches: {
    type: Number,
    default: 0
  },
  tabSwitchTimestamps: [Date],
  startedAt: Date,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['on-time', 'late'],
    default: 'on-time'
  }
}, { timestamps: true });

export const Assignment = mongoose.model('Assignment', assignmentSchema);
export const Submission = mongoose.model('Submission', submissionSchema);
