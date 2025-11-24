import mongoose from 'mongoose';

const teacherAssignmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  timeSlot: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('TeacherAssignment', teacherAssignmentSchema);
