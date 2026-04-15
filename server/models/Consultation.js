import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentName: { type: String, required: true },
  teacherName: { type: String, required: true },
  message: { type: String, required: true },
  day: { type: String, required: true }, // e.g., 'mon'
  period: { type: String, required: true }, // e.g., '9:00 - 9:50'
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  reply: { type: String, default: '' },
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Consultation', consultationSchema);
