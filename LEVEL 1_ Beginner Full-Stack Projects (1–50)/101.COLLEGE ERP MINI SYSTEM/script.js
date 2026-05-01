const API_BASE = 'http://localhost:3000/api';

let students = [];
let courses = [];
let grades = [];
let attendance = [];

document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', (e) => {
        e.preventDefault();
        const tabName = tab.dataset.tab;
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('[data-tab]').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    if (tabName === 'students') loadStudents();
    if (tabName === 'courses') loadCourses();
    if (tabName === 'grades') loadGrades();
    if (tabName === 'attendance') loadAttendance();
}

function toggleForm(formId) {
    const form = document.getElementById(formId);
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addStudent() {
    const name = document.getElementById('studentName').value;
    const email = document.getElementById('studentEmail').value;
    const roll = document.getElementById('studentRoll').value;
    const dept = document.getElementById('studentDept').value;
    
    if (!name || !email || !roll || !dept) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, roll, dept })
        });
        
        if (response.ok) {
            document.getElementById('studentForm').reset();
            toggleForm('studentForm');
            loadStudents();
            updateDashboard();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE}/students`);
        students = await response.json();
        renderStudents();
        populateSelectOptions('gradeStudent', students);
        populateSelectOptions('attendanceStudent', students);
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderStudents() {
    const container = document.getElementById('studentsList');
    
    if (students.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👨‍🎓</div><p>No students added yet</p></div>';
        return;
    }
    
    container.innerHTML = students.map(s => `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">${s.name}</div>
                    <div class="card-subtitle">Roll: ${s.roll}</div>
                </div>
                <span class="badge badge-primary">${s.dept}</span>
            </div>
            <div class="card-detail">
                <span>📧 ${s.email}</span>
                <button class="btn-danger" onclick="deleteStudent('${s.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteStudent(id) {
    if (confirm('Are you sure?')) {
        try {
            await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
            loadStudents();
            updateDashboard();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

async function addCourse() {
    const name = document.getElementById('courseName').value;
    const code = document.getElementById('courseCode').value;
    const credits = document.getElementById('courseCredits').value;
    const faculty = document.getElementById('courseFaculty').value;
    
    if (!name || !code || !credits || !faculty) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, code, credits, faculty })
        });
        
        if (response.ok) {
            document.getElementById('courseForm').reset();
            toggleForm('courseForm');
            loadCourses();
            updateDashboard();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadCourses() {
    try {
        const response = await fetch(`${API_BASE}/courses`);
        courses = await response.json();
        renderCourses();
        populateSelectOptions('gradeCourse', courses);
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderCourses() {
    const container = document.getElementById('coursesList');
    
    if (courses.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📚</div><p>No courses added yet</p></div>';
        return;
    }
    
    container.innerHTML = courses.map(c => `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">${c.name}</div>
                    <div class="card-subtitle">Code: ${c.code}</div>
                </div>
                <span class="badge badge-success">${c.credits} Credits</span>
            </div>
            <div class="card-detail">
                <span>👨‍🏫 ${c.faculty}</span>
                <button class="btn-danger" onclick="deleteCourse('${c.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function deleteCourse(id) {
    if (confirm('Are you sure?')) {
        try {
            await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE' });
            loadCourses();
            updateDashboard();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

async function addGrade() {
    const studentId = document.getElementById('gradeStudent').value;
    const courseId = document.getElementById('gradeCourse').value;
    const score = document.getElementById('gradeScore').value;
    
    if (!studentId || !courseId || !score) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/grades`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, courseId, score })
        });
        
        if (response.ok) {
            document.getElementById('gradeForm').reset();
            toggleForm('gradeForm');
            loadGrades();
            updateDashboard();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadGrades() {
    try {
        const response = await fetch(`${API_BASE}/grades`);
        grades = await response.json();
        renderGrades();
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderGrades() {
    const container = document.getElementById('gradesList');
    
    if (grades.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><p>No grades recorded yet</p></div>';
        return;
    }
    
    container.innerHTML = grades.map(g => {
        const student = students.find(s => s.id === g.studentId);
        const course = courses.find(c => c.id === g.courseId);
        const letterGrade = getLetterGrade(g.score);
        
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${student?.name || 'Unknown'}</div>
                        <div class="card-subtitle">${course?.name || 'Unknown'}</div>
                    </div>
                    <span class="badge badge-primary">${letterGrade}</span>
                </div>
                <div class="card-detail">
                    <span>Score: ${g.score}/100</span>
                    <button class="btn-danger" onclick="deleteGrade('${g.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function getLetterGrade(score) {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
}

async function deleteGrade(id) {
    if (confirm('Are you sure?')) {
        try {
            await fetch(`${API_BASE}/grades/${id}`, { method: 'DELETE' });
            loadGrades();
            updateDashboard();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

async function markAttendance() {
    const studentId = document.getElementById('attendanceStudent').value;
    const date = document.getElementById('attendanceDate').value;
    const status = document.getElementById('attendanceStatus').value;
    
    if (!studentId || !date || !status) {
        alert('Please fill all fields');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/attendance`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, date, status })
        });
        
        if (response.ok) {
            document.getElementById('attendanceForm').reset();
            toggleForm('attendanceForm');
            loadAttendance();
            updateDashboard();
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadAttendance() {
    try {
        const response = await fetch(`${API_BASE}/attendance`);
        attendance = await response.json();
        renderAttendance();
    } catch (error) {
        console.error('Error:', error);
    }
}

function renderAttendance() {
    const container = document.getElementById('attendanceList');
    
    if (attendance.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📋</div><p>No attendance records yet</p></div>';
        return;
    }
    
    container.innerHTML = attendance.map(a => {
        const student = students.find(s => s.id === a.studentId);
        const badgeClass = a.status === 'Present' ? 'badge-success' : 
                          a.status === 'Absent' ? 'badge-danger' : 'badge-warning';
        
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <div class="card-title">${student?.name || 'Unknown'}</div>
                        <div class="card-subtitle">${new Date(a.date).toLocaleDateString()}</div>
                    </div>
                    <span class="badge ${badgeClass}">${a.status}</span>
                </div>
                <div class="card-detail">
                    <button class="btn-danger" onclick="deleteAttendance('${a.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

async function deleteAttendance(id) {
    if (confirm('Are you sure?')) {
        try {
            await fetch(`${API_BASE}/attendance/${id}`, { method: 'DELETE' });
            loadAttendance();
            updateDashboard();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function populateSelectOptions(selectId, dataArray) {
    const select = document.getElementById(selectId);
    const currentValue = select.value;
    const options = select.innerHTML.split('\n')[0];
    
    select.innerHTML = options + dataArray.map(item => 
        `<option value="${item.id}">${item.name}</option>`
    ).join('');
    
    select.value = currentValue;
}

async function updateDashboard() {
    try {
        const [studentsRes, coursesRes, gradesRes, attendanceRes] = await Promise.all([
            fetch(`${API_BASE}/students`),
            fetch(`${API_BASE}/courses`),
            fetch(`${API_BASE}/grades`),
            fetch(`${API_BASE}/attendance`)
        ]);
        
        const s = await studentsRes.json();
        const c = await coursesRes.json();
        const g = await gradesRes.json();
        const a = await attendanceRes.json();
        
        document.getElementById('studentCount').textContent = s.length;
        document.getElementById('courseCount').textContent = c.length;
        
        const avgGrade = g.length > 0 ? (g.reduce((sum, grade) => sum + parseFloat(grade.score), 0) / g.length).toFixed(1) : 0;
        document.getElementById('avgGrade').textContent = avgGrade;
        
        const presentDays = a.filter(att => att.status === 'Present').length;
        const attendancePercent = a.length > 0 ? Math.round((presentDays / a.length) * 100) : 0;
        document.getElementById('attendanceRate').textContent = attendancePercent + '%';
    } catch (error) {
        console.error('Error:', error);
    }
}

loadStudents();
loadCourses();
loadGrades();
loadAttendance();
updateDashboard();
