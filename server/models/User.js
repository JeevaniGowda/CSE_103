import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  subject: { type: String }, // For Teachers
  className: { type: String }, // For Students (e.g. 'Year 1 - CS')
  tuitionFee: { type: Number, default: 45000 },
  libraryFee: { type: Number, default: 2500 },
  labFee: { type: Number, default: 5000 },
  paidAmount: { type: Number, default: 0 },
  feesPaid: { type: Boolean, default: false },
  paymentHistory: [{
    amount: Number,
    orderId: String,
    paymentId: String,
    date: { type: Date, default: Date.now },
    status: String
  }]
});

export default mongoose.model('User', userSchema);
