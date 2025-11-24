import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    trim: true
  },
  section: {
    type: String,
    default: 'A',
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

// Compound unique index for code + section combination
courseSchema.index({ code: 1, section: 1 }, { unique: true });

export default mongoose.model('Course', courseSchema);
