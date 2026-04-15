import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  class: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  time: { type: String, required: true }, // Format: HH:MM AM/PM
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['present'], default: 'present' }
});

// Compound index to prevent duplicate attendance for a student in the same class on the same day
attendanceSchema.index({ studentId: 1, class: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
