import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isShared: {
    type: Boolean,
    default: false
  },
  sharedWith: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    fileName: String,
    fileData: String,
    fileType: String,
    fileSize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

export default mongoose.model('Note', noteSchema);
