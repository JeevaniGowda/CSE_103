import mongoose from 'mongoose';

const classTimetableSchema = new mongoose.Schema({
  className: { type: String, required: true },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  periods: [
    {
      time: String,
      subject: String,
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      teacherName: String,
      isFree: { type: Boolean, default: false }
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

// To ensure we only have one record per class and day
classTimetableSchema.index({ className: 1, day: 1 }, { unique: true });

export default mongoose.model('ClassTimetable', classTimetableSchema);
