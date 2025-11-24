import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Ensure a student can only enroll once per course
enrollmentSchema.index({ student: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
