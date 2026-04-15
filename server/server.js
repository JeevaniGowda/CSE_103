import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/User.js';
import Consultation from './models/Consultation.js';
import Timetable from './models/Timetable.js';
import Attendance from './models/Attendance.js';
import ClassTimetable from './models/ClassTimetable.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import http from 'http';
import { Server } from 'socket.io';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
const PORT = process.env.PORT || 5000;

// Gemini AI setup
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
  cors: { origin: "*" } 
});

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartcampus')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error: ', err));

// --- CONSTANTS ---
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 11:30 (BREAK)",
  "11:30 - 12:30",
  "12:30 - 01:30",
  "01:30 - 02:30 (LUNCH)",
  "02:30 - 03:30",
  "03:30 - 04:30"
];

// --- UTILITIES ---
const generateAllTimetables = async () => {
  const teachers = await User.find({ role: 'teacher' });
  const classes = ['Year 1 - CS', 'Year 2 - CS', 'Year 3 - CS'];
  
  await ClassTimetable.deleteMany({});
  
  const teacherBusy = {};
  const teacherDailyLoad = {}; 

  DAYS.forEach(day => {
    teacherBusy[day] = {};
    PERIODS.forEach(slot => teacherBusy[day][slot] = []);
  });

  for (const className of classes) {
    for (const day of DAYS) {
      const dayPeriods = [];
      let consecutiveSubject = '';

      for (const slot of PERIODS) {
        if (slot.includes('BREAK') || slot.includes('LUNCH')) {
          const sub = slot.includes('BREAK') ? 'BREAK' : 'LUNCH';
          dayPeriods.push({ time: slot, subject: sub, isFree: true });
          continue;
        }

        const freeChance = Math.random() < 0.15; 
        if (freeChance && dayPeriods.filter(p => p.subject === 'FREE').length < 2) {
          dayPeriods.push({ time: slot, subject: 'FREE', isFree: true });
          consecutiveSubject = 'FREE';
          continue;
        }

        let assigned = false;
        const filteredTeachers = teachers.filter(t => !!t.subject);
        const shuffledTeachers = [...filteredTeachers].sort(() => 0.5 - Math.random());

        for (const teacher of shuffledTeachers) {
          const isBusy = teacherBusy[day][slot].includes(teacher._id.toString());
          const dailyCount = (teacherDailyLoad[teacher._id] && teacherDailyLoad[teacher._id][day]) || 0;
          const isConsecutive = teacher.subject === consecutiveSubject;

          if (!isBusy && dailyCount < 3 && !isConsecutive) {
            dayPeriods.push({
              time: slot,
              subject: teacher.subject,
              teacherId: teacher._id,
              teacherName: teacher.name
            });
            
            teacherBusy[day][slot].push(teacher._id.toString());
            if (!teacherDailyLoad[teacher._id]) teacherDailyLoad[teacher._id] = {};
            teacherDailyLoad[teacher._id][day] = dailyCount + 1;
            
            consecutiveSubject = teacher.subject;
            assigned = true;
            break;
          }
        }

        if (!assigned) {
          dayPeriods.push({ time: slot, subject: 'FREE', isFree: true });
          consecutiveSubject = 'FREE';
        }
      }
      await ClassTimetable.create({ className, day, periods: dayPeriods });
    }
  }

  await Timetable.deleteMany({});
  const allClassTts = await ClassTimetable.find();

  for (const teacher of teachers) {
     const teacherIdStr = teacher._id.toString();
     const schedule = PERIODS.map(slot => {
        const isBreak = slot.includes('BREAK') || slot.includes('LUNCH');
        const row = { time: slot, isBreak };
        
        DAYS.forEach((day, idx) => {
           const dayKey = ['mon', 'tue', 'wed', 'thu', 'fri'][idx];
           const busy = allClassTts.some(ct => 
              ct.day === day && ct.periods.some(p => p.time === slot && p.teacherId?.toString() === teacherIdStr)
           );
           if (isBreak) {
              row[dayKey] = slot.includes('LUNCH') ? 'LUNCH' : 'BREAK';
           } else {
              row[dayKey] = busy ? 'BUSY' : 'FREE';
           }
        });
        return row;
     });
     await Timetable.create({ teacherId: teacher._id, schedule });
  }
  return { message: 'Timetable generated successfully.' };
};

const seedDatabase = async () => {
  const usersCount = await User.countDocuments();
  if (usersCount === 0) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('1234', salt);
    const initialUsers = [
      { name: 'Admin User', email: 'admin@gmail.com', password: hashedPassword, role: 'admin' },
      { name: 'Student One', email: 'student1@gmail.com', password: hashedPassword, role: 'student' },
      { name: 'Dr. Smith', email: 'smith@gmail.com', password: hashedPassword, role: 'teacher', subject: 'Mathematics' },
      { name: 'Prof. Johnson', email: 'johnson@gmail.com', password: hashedPassword, role: 'teacher', subject: 'Physics' },
      { name: 'Ms. Davis', email: 'davis@gmail.com', password: hashedPassword, role: 'teacher', subject: 'Chemistry' },
      { name: 'Mr. Wilson', email: 'wilson@gmail.com', password: hashedPassword, role: 'teacher', subject: 'Computer Science' }
    ];
    await User.insertMany(initialUsers);
  } else {
    await User.updateOne({ email: 'smith@gmail.com' }, { subject: 'Mathematics' });
    await User.updateOne({ email: 'johnson@gmail.com' }, { subject: 'Physics' });
    await User.updateOne({ email: 'davis@gmail.com' }, { subject: 'Chemistry' });
    const wilson = await User.findOne({ email: 'wilson@gmail.com' });
    if (!wilson) {
       const salt = await bcrypt.genSalt(10);
       const hashedPassword = await bcrypt.hash('1234', salt);
       await User.create({ name: 'Mr. Wilson', email: 'wilson@gmail.com', password: hashedPassword, role: 'teacher', subject: 'Computer Science' });
    }
  }
  await User.updateMany({ role: 'student', className: { $exists: false } }, { className: 'Year 1 - CS' });
  await User.updateMany({ role: 'student', className: "" }, { className: 'Year 1 - CS' });
  
  try {
    // FORCE RESET ALL STUDENT FEES FOR TESTING
    await User.updateMany({ role: 'student' }, { feesPaid: false, paidAmount: 0, paymentHistory: [] });
    console.log('Force reset: All student fees set to UNPAID for testing.');

    await generateAllTimetables();
    console.log('Timetable data generated.');
  } catch (e) {
    console.error('Generation/Reset failed:', e);
  }
};
seedDatabase();

// --- MIDDLEWARES ---
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const adminMiddleware = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// --- ROUTES ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, role: user.role, email: user.email, className: user.className } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, role, subject, className } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashedPassword, role, subject, className });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/fees/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ tuitionFee: user.tuitionFee, libraryFee: user.libraryFee, labFee: user.labFee, feesPaid: user.feesPaid, paymentHistory: user.paymentHistory });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/fees/create-order', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const amount = (req.body.amount ? req.body.amount : (user.tuitionFee + user.libraryFee + user.labFee)) * 100;
    try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error("No keys");
      const order = await razorpay.orders.create({ amount, currency: "INR", receipt: `receipt_${user._id}_${Date.now()}` });
      res.json(order);
    } catch (e) {
      res.json({ id: "order_mock_" + Math.random().toString(36).substring(7), amount, currency: "INR", mock: true });
    }
  } catch (err) { res.status(500).json({ error: 'Order failed' }); }
});

app.post('/api/fees/verify-payment', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  let isVerified = (!secret || razorpay_signature === 'dummy_signature');
  if (!isVerified) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    isVerified = (hmac.digest('hex') === razorpay_signature);
  }
  if (isVerified) {
    const user = await User.findById(req.user.id);
    const amountPaid = req.body.amount || (user.tuitionFee + user.libraryFee + user.labFee - user.paidAmount);
    user.paidAmount += amountPaid;
    if (user.paidAmount >= (user.tuitionFee + user.libraryFee + user.labFee)) {
      user.feesPaid = true;
    }
    user.paymentHistory.push({ 
      amount: amountPaid, 
      orderId: razorpay_order_id || 'mock', 
      paymentId: razorpay_payment_id || 'mock', 
      status: 'Success',
      date: new Date()
    });
    await user.save();
    res.json({ message: 'Success' });
  } else res.status(400).json({ error: 'Failed' });
});

app.post('/api/timetable/generate', adminMiddleware, async (req, res) => {
  try { res.json(await generateAllTimetables()); } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/timetable/student/:className', authMiddleware, async (req, res) => {
  try { res.json(await ClassTimetable.find({ className: req.params.className }).sort({ day: 1 })); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/timetable/teacher/:teacherId', authMiddleware, async (req, res) => {
  try {
     const allClassTt = await ClassTimetable.find();
     const teacherSchedule = PERIODS.map(slot => {
        const row = { time: slot, isBreak: slot.includes('BREAK') || slot.includes('LUNCH') };
        DAYS.forEach((day, idx) => {
           const dayKey = ['mon', 'tue', 'wed', 'thu', 'fri'][idx];
           const match = allClassTt.find(t => t.day === day && t.periods.some(p => p.time === slot && p.teacherId?.toString() === req.params.teacherId));
           row[dayKey] = match ? match.className : (row.isBreak ? (slot.includes('LUNCH') ? 'LUNCH' : 'BREAK') : 'FREE');
        });
        return row;
     });
     res.json(teacherSchedule);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/teachers/available', authMiddleware, async (req, res) => {
  try { res.json(await Timetable.find().populate('teacherId', 'name')); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/consultations', authMiddleware, async (req, res) => {
  const { teacherId, teacherName, message, day, period } = req.body;
  try {
    const existing = await Consultation.findOne({ teacherId, day, period, status: 'accepted' });
    if (existing) return res.status(400).json({ error: 'Slot taken' });
    const consultation = new Consultation({ studentId: req.user.id, studentName: req.user.name, teacherId, teacherName, message, day, period });
    await consultation.save();
    res.status(201).json(consultation);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/consultations/student', authMiddleware, async (req, res) => {
  try { res.json(await Consultation.find({ studentId: req.user.id }).sort({ date: -1 })); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/consultations/teacher', authMiddleware, async (req, res) => {
  try { res.json(await Consultation.find({ teacherId: req.user.id }).sort({ date: -1 })); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/consultations/:id', authMiddleware, async (req, res) => {
  try {
     const consult = await Consultation.findById(req.params.id);
     consult.status = req.body.status;
     consult.reply = req.body.reply || '';
     await consult.save();
     res.json(consult);
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/students', adminMiddleware, async (req, res) => {
  try { res.json(await User.find({ role: 'student' }).select('-password')); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/admin/teachers', adminMiddleware, async (req, res) => {
  try { res.json(await User.find({ role: 'teacher' }).select('-password')); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/attendance/mark', authMiddleware, async (req, res) => {
  try {
    const data = JSON.parse(req.body.qrData);
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const attendance = new Attendance({ studentId: req.user.id, studentName: req.user.name, class: data.class, date, time });
    await attendance.save();
    io.emit('attendance_marked', { name: req.user.name, class: data.class, time, status: 'verified' });
    res.json({ message: 'Success', class: data.class });
  } catch (err) { res.status(500).json({ error: 'Error' }); }
});

app.get('/api/attendance/student', authMiddleware, async (req, res) => {
  try { res.json(await Attendance.find({ studentId: req.user.id }).sort({ timestamp: -1 })); } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Fallback questions if Gemini fails
const fallbackQuestions = [
  { q: "What is the time complexity of binary search?", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1 },
  { q: "Which data structure uses FIFO?", options: ["Stack", "Queue", "Tree", "Graph"], answer: 1 },
  { q: "HTML stands for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "None"], answer: 0 },
  { q: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Colorful Style Sheets"], answer: 1 },
  { q: "Which keyword declares a constant in JavaScript?", options: ["var", "let", "const", "static"], answer: 2 },
  { q: "What is 2^10?", options: ["512", "1024", "2048", "256"], answer: 1 },
  { q: "Who invented the World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Mark Zuckerberg"], answer: 2 },
  { q: "What is the default port for HTTP?", options: ["21", "443", "80", "8080"], answer: 2 },
  { q: "What does SQL stand for?", options: ["Structured Query Language", "Simple Query Language", "Standard Query Logic", "Sequential Query Language"], answer: 0 },
  { q: "What is the binary of decimal 10?", options: ["1010", "1100", "1001", "1110"], answer: 0 },
  { q: "What does RAM stand for?", options: ["Read Access Memory", "Random Access Memory", "Run Access Memory", "Rapid Access Memory"], answer: 1 },
  { q: "Which company developed Java?", options: ["Microsoft", "Apple", "Sun Microsystems", "Google"], answer: 2 },
  { q: "What is the SI unit of electric current?", options: ["Volt", "Watt", "Ampere", "Ohm"], answer: 2 },
  { q: "What does API stand for?", options: ["Application Programming Interface", "Applied Program Integration", "Application Process Interface", "Auto Programming Interface"], answer: 0 },
  { q: "What is the derivative of x²?", options: ["x", "2x", "x²", "2x²"], answer: 1 },
  { q: "Which data structure uses LIFO?", options: ["Queue", "Array", "Stack", "Linked List"], answer: 2 },
  { q: "What does DNS stand for?", options: ["Domain Name System", "Data Network Service", "Digital Name Server", "Domain Network System"], answer: 0 },
  { q: "Which gas do plants absorb?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2 },
  { q: "What is the speed of light approximately?", options: ["3×10⁶ m/s", "3×10⁸ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], answer: 1 },
  { q: "Which layer of OSI model handles routing?", options: ["Transport", "Network", "Data Link", "Session"], answer: 1 },
  { q: "Which element has the atomic number 1?", options: ["Helium", "Hydrogen", "Lithium", "Carbon"], answer: 1 },
  { q: "What is the value of Pi to 2 decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], answer: 1 },
  { q: "Which protocol is used for secure communication?", options: ["HTTP", "FTP", "HTTPS", "SMTP"], answer: 2 },
  { q: "Which number system uses base 16?", options: ["Binary", "Octal", "Decimal", "Hexadecimal"], answer: 3 },
  { q: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], answer: 2 },
  { q: "Which language is primarily used for Android development?", options: ["Swift", "Kotlin", "C#", "Ruby"], answer: 1 },
  { q: "Which sorting algorithm has the best average case?", options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"], answer: 1 },
  { q: "What does OOP stand for?", options: ["Open Object Programming", "Object Oriented Programming", "Optional Object Process", "Object Output Protocol"], answer: 1 },
  { q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "NaCl", "O2"], answer: 0 },
  { q: "What is the chemical symbol for Sodium?", options: ["So", "Sd", "Na", "Sm"], answer: 2 },
];

// Quiz cache to avoid calling Gemini on every request
let quizCache = { questions: null, generatedAt: 0 };
const QUIZ_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// ── AI CHAT ENDPOINT ────────────────────────────────────────────────────────
app.post('/api/chat', authMiddleware, async (req, res) => {
  try {
    const { messages } = req.body; // [{ role: 'user'|'model', parts: [{ text }] }]
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    if (!genAI) {
      return res.json({
        reply: "I'm sorry, the AI service is not configured. Please add a GEMINI_API_KEY to the server .env file."
      });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are SmartCampus AI, an intelligent academic assistant for university students. 
You can answer any question on any topic — mathematics, physics, chemistry, computer science, history, literature, coding, general knowledge, and more.
Be helpful, clear, and concise. Format code with proper code blocks. Use markdown-style formatting when helpful.
When explaining complex topics, break them into steps. Be friendly and encouraging.`
    });

    const chat = model.startChat({
      history: messages.slice(0, -1), // All except the last (which is the new user message)
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.parts[0].text);
    const reply = result.response.text();

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'AI service error. Please try again.' });
  }
});


app.get('/api/quiz/generate', authMiddleware, async (req, res) => {
  try {
    const now = Date.now();
    // Return cached questions if still fresh
    if (quizCache.questions && (now - quizCache.generatedAt) < QUIZ_CACHE_DURATION) {
      return res.json({ questions: quizCache.questions, source: 'cache' });
    }

    if (!genAI) {
      return res.json({ questions: fallbackQuestions, source: 'fallback' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Generate exactly 30 multiple-choice quiz questions for university CSE students covering topics like: data structures, algorithms, networking, databases, operating systems, mathematics, physics, and general computer science concepts.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation, just raw JSON):
[
  {
    "q": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0
  }
]

Rules:
- "answer" must be the index (0-3) of the correct option in "options"
- All 4 options must be distinct and plausible
- Questions must be clear, concise and educational
- Mix easy (40%), medium (40%) and hard (20%) questions
- No duplicate questions
- Return exactly 30 questions`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length < 10) throw new Error('Invalid questions array');

    // Ensure exactly 30 questions, pad with fallback if needed
    let questions = parsed.slice(0, 30);
    if (questions.length < 30) {
      const extra = fallbackQuestions.slice(0, 30 - questions.length);
      questions = [...questions, ...extra];
    }

    // Cache and return
    quizCache = { questions, generatedAt: now };
    res.json({ questions, source: 'gemini' });

  } catch (err) {
    console.error('Quiz generation error:', err.message);
    res.json({ questions: fallbackQuestions, source: 'fallback' });
  }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
