const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const readline = require('readline');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let students = [];
let courses = [];
let grades = [];
let attendance = [];

app.get('/api/students', (req, res) => {
    res.json(students);
});

app.post('/api/students', (req, res) => {
    const { name, email, roll, dept } = req.body;
    const student = { id: uuidv4(), name, email, roll, dept };
    students.push(student);
    res.status(201).json(student);
});

app.delete('/api/students/:id', (req, res) => {
    students = students.filter(s => s.id !== req.params.id);
    res.json({ success: true });
});

app.get('/api/courses', (req, res) => {
    res.json(courses);
});

app.post('/api/courses', (req, res) => {
    const { name, code, credits, faculty } = req.body;
    const course = { id: uuidv4(), name, code, credits: parseInt(credits), faculty };
    courses.push(course);
    res.status(201).json(course);
});

app.delete('/api/courses/:id', (req, res) => {
    courses = courses.filter(c => c.id !== req.params.id);
    res.json({ success: true });
});

app.get('/api/grades', (req, res) => {
    res.json(grades);
});

app.post('/api/grades', (req, res) => {
    const { studentId, courseId, score } = req.body;
    const grade = { id: uuidv4(), studentId, courseId, score: parseFloat(score), date: new Date() };
    grades.push(grade);
    res.status(201).json(grade);
});

app.delete('/api/grades/:id', (req, res) => {
    grades = grades.filter(g => g.id !== req.params.id);
    res.json({ success: true });
});

app.get('/api/attendance', (req, res) => {
    res.json(attendance);
});

app.post('/api/attendance', (req, res) => {
    const { studentId, date, status } = req.body;
    const attendanceRecord = { id: uuidv4(), studentId, date, status };
    attendance.push(attendanceRecord);
    res.status(201).json(attendanceRecord);
});

app.delete('/api/attendance/:id', (req, res) => {
    attendance = attendance.filter(a => a.id !== req.params.id);
    res.json({ success: true });
});

const PORT = 3000;

const server = app.listen(PORT, () => {
    console.log('\n');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║       🎓  COLLEGE ERP SYSTEM - SERVER STARTED  🎓          ║');
    console.log('╠════════════════════════════════════════════════════════════╣');
    console.log(`║  📡 HOST LINK: http://localhost:${PORT}                         ║`);
    console.log('║  ✅ Server running successfully                            ║');
    console.log('║  💾 Database: In-Memory                                    ║');
    console.log('║  🚀 Ready to accept connections                            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    console.log('Type "help" for commands or "quit" to exit\n');
});

rl.on('line', (input) => {
    const command = input.trim().toLowerCase();
    
    if (command === 'quit' || command === 'exit') {
        console.log('\n✅ Server shutting down...');
        server.close();
        rl.close();
        process.exit(0);
    } else if (command === 'help') {
        console.log('\n📋 Available Commands:');
        console.log('  status     - Show current data count');
        console.log('  clear      - Clear all data');
        console.log('  quit/exit  - Stop the server');
        console.log('  help       - Show this help message\n');
    } else if (command === 'status') {
        console.log('\n📊 Current Data Status:');
        console.log(`  Students:   ${students.length}`);
        console.log(`  Courses:    ${courses.length}`);
        console.log(`  Grades:     ${grades.length}`);
        console.log(`  Attendance: ${attendance.length}\n`);
    } else if (command === 'clear') {
        students = [];
        courses = [];
        grades = [];
        attendance = [];
        console.log('\n🗑️  All data cleared!\n');
    } else if (command) {
        console.log('❌ Unknown command. Type "help" for available commands.\n');
    }
});
