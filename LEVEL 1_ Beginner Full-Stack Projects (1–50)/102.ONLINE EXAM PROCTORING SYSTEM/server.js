const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(express.static(path.join(__dirname)));
app.use(express.json());

const activeExams = new Map();
const proctoringSessions = new Map();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
  console.log(`\n📱 User connected: ${socket.id}`);

  socket.on('startExam', (data) => {
    const examId = 'EXAM_' + Date.now();
    activeExams.set(examId, {
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      examTitle: data.examTitle,
      duration: data.duration,
      startTime: new Date(),
      socketId: socket.id,
      webcamEnabled: data.webcamEnabled,
      flags: []
    });
    
    proctoringSessions.set(socket.id, examId);
    
    console.log(`✅ Exam Started: ${examId}`);
    console.log(`   Student: ${data.studentName}`);
    console.log(`   Email: ${data.studentEmail}`);
    console.log(`   Exam: ${data.examTitle}`);
    console.log(`   Duration: ${data.duration} minutes`);
    
    socket.emit('examStarted', { examId, message: 'Exam started successfully' });
    io.emit('updateStats', { activeExams: activeExams.size });
  });

  socket.on('submitAnswer', (data) => {
    const examId = proctoringSessions.get(socket.id);
    if (examId && activeExams.has(examId)) {
      const exam = activeExams.get(examId);
      console.log(`📝 Answer Submitted - Q${data.questionNumber}: ${data.answer}`);
      socket.emit('answerConfirmed', { success: true });
    }
  });

  socket.on('flagActivity', (data) => {
    const examId = proctoringSessions.get(socket.id);
    if (examId && activeExams.has(examId)) {
      const exam = activeExams.get(examId);
      exam.flags.push({
        type: data.type,
        timestamp: new Date(),
        details: data.details
      });
      console.log(`⚠️  Flag: ${data.type} - ${data.details}`);
    }
  });

  socket.on('submitExam', (data) => {
    const examId = proctoringSessions.get(socket.id);
    if (examId && activeExams.has(examId)) {
      const exam = activeExams.get(examId);
      const endTime = new Date();
      const duration = Math.round((endTime - exam.startTime) / 60000);
      
      console.log(`\n🎉 Exam Submitted!`);
      console.log(`   Exam ID: ${examId}`);
      console.log(`   Student: ${exam.studentName}`);
      console.log(`   Duration: ${duration} minutes`);
      console.log(`   Total Questions: ${data.totalQuestions}`);
      console.log(`   Answered: ${data.answered}`);
      console.log(`   Score: ${data.score}/${data.totalQuestions}`);
      console.log(`   Flags: ${exam.flags.length}`);
      
      socket.emit('resultGenerated', {
        score: data.score,
        totalQuestions: data.totalQuestions,
        percentage: ((data.score / data.totalQuestions) * 100).toFixed(2),
        flags: exam.flags.length
      });
      
      activeExams.delete(examId);
      proctoringSessions.delete(socket.id);
    }
  });

  socket.on('disconnect', () => {
    const examId = proctoringSessions.get(socket.id);
    if (examId && activeExams.has(examId)) {
      const exam = activeExams.get(examId);
      console.log(`\n❌ Exam Abandoned: ${exam.studentName} (${examId})`);
      activeExams.delete(examId);
    }
    proctoringSessions.delete(socket.id);
    console.log(`🚪 User disconnected: ${socket.id}\n`);
    io.emit('updateStats', { activeExams: activeExams.size });
  });

  socket.on('proctorCheck', (data) => {
    console.log(`🔍 Proctor Check: ${data.activity}`);
    socket.emit('proctorAck', { received: true });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🎓 ONLINE EXAM PROCTORING SYSTEM');
  console.log('='.repeat(60));
  console.log(`\n🌐 Server is running on: http://localhost:${PORT}`);
  console.log(`✨ Open your browser and navigate to the URL above`);
  console.log(`\n📊 Features Active:`);
  console.log(`   ✓ Proctoring Monitoring`);
  console.log(`   ✓ Real-time Session Tracking`);
  console.log(`   ✓ Activity Flagging`);
  console.log(`   ✓ Exam Result Generation`);
  console.log('\n' + '='.repeat(60) + '\n');
});
