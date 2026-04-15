import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schedule: [
    {
      time: String,
      mon: { type: String, default: 'FREE' },
      tue: { type: String, default: 'FREE' },
      wed: { type: String, default: 'FREE' },
      thu: { type: String, default: 'FREE' },
      fri: { type: String, default: 'FREE' },
      isBreak: { type: Boolean, default: false }
    }
  ]
});

export default mongoose.model('Timetable', timetableSchema);
