const socket = io();

const examData = {
  questions: [
    {
      id: 1,
      title: 'What is the capital of France?',
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      correct: 'Paris'
    },
    {
      id: 2,
      title: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
      correct: 'Mars'
    },
    {
      id: 3,
      title: 'What is the largest ocean on Earth?',
      options: ['Atlantic', 'Indian', 'Arctic', 'Pacific'],
      correct: 'Pacific'
    },
    {
      id: 4,
      title: 'Who wrote "Hamlet"?',
      options: ['Jane Austen', 'William Shakespeare', 'Mark Twain', 'F. Scott Fitzgerald'],
      correct: 'William Shakespeare'
    },
    {
      id: 5,
      title: 'What is the chemical symbol for Gold?',
      options: ['Go', 'Gd', 'Au', 'Ag'],
      correct: 'Au'
    },
    {
      id: 6,
      title: 'What year did the Titanic sink?',
      options: ['1912', '1915', '1920', '1905'],
      correct: '1912'
    },
    {
      id: 7,
      title: 'Which country is home to the Great Wall?',
      options: ['Japan', 'Korea', 'China', 'Vietnam'],
      correct: 'China'
    },
    {
      id: 8,
      title: 'What is the smallest prime number?',
      options: ['0', '1', '2', '3'],
      correct: '2'
    },
    {
      id: 9,
      title: 'Who invented the telephone?',
      options: ['Thomas Edison', 'Alexander Graham Bell', 'Nikola Tesla', 'Benjamin Franklin'],
      correct: 'Alexander Graham Bell'
    },
    {
      id: 10,
      title: 'What is the speed of light?',
      options: ['300,000 km/s', '150,000 km/s', '100,000 km/s', '500,000 km/s'],
      correct: '300,000 km/s'
    }
  ],
  
  studentAnswers: {},
  flaggedQuestions: new Set(),
  currentQuestion: 1,
  examId: null,
  startTime: null,
  duration: 0,
  examActive: false
};

const elements = {
  loginContainer: document.getElementById('loginContainer'),
  examContainer: document.getElementById('examContainer'),
  resultContainer: document.getElementById('resultContainer'),
  loginForm: document.getElementById('loginForm'),
  studentName: document.getElementById('studentName'),
  studentEmail: document.getElementById('studentEmail'),
  examTitle: document.getElementById('examTitle'),
  duration: document.getElementById('duration'),
  webcamEnabled: document.getElementById('webcamEnabled'),
  
  examTitleDisplay: document.getElementById('examTitle'),
  studentInfo: document.getElementById('studentInfo'),
  timeRemaining: document.getElementById('timeRemaining'),
  questionsList: document.getElementById('questionsList'),
  questionDisplay: document.getElementById('questionDisplay'),
  answersContainer: document.getElementById('answersContainer'),
  previousBtn: document.getElementById('previousBtn'),
  nextBtn: document.getElementById('nextBtn'),
  flagBtn: document.getElementById('flagBtn'),
  submitExamBtn: document.getElementById('submitExamBtn'),
  
  webcamPreview: document.getElementById('webcamPreview'),
  webcamStatus: document.getElementById('webcamStatus'),
  activityLog: document.getElementById('activityLog'),
  
  scorePercentage: document.getElementById('scorePercentage'),
  totalQuestions: document.getElementById('totalQuestions'),
  correctAnswers: document.getElementById('correctAnswers'),
  accuracy: document.getElementById('accuracy'),
  flagsCount: document.getElementById('flagsCount'),
  retakeBtn: document.getElementById('retakeBtn'),
  
  warningModal: document.getElementById('warningModal'),
  warningMessage: document.getElementById('warningMessage'),
  warningOkBtn: document.getElementById('warningOkBtn')
};

function showWarning(message) {
  elements.warningMessage.textContent = message;
  elements.warningModal.classList.remove('hidden');
}

elements.warningOkBtn.addEventListener('click', () => {
  elements.warningModal.classList.add('hidden');
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function updateTimer() {
  if (!examData.examActive) return;
  
  const now = new Date();
  const elapsed = Math.floor((now - examData.startTime) / 1000);
  const remaining = Math.max(0, examData.duration * 60 - elapsed);
  
  elements.timeRemaining.textContent = formatTime(remaining);
  
  if (remaining < 300) {
    elements.timeRemaining.style.animation = 'pulse 1s infinite';
  }
  
  if (remaining === 0) {
    examData.examActive = false;
    submitExam();
  }
}

setInterval(updateTimer, 1000);

function renderQuestion(questionId) {
  const question = examData.questions.find(q => q.id === questionId);
  if (!question) return;
  
  elements.questionDisplay.innerHTML = `
    <h3>Question ${questionId} of ${examData.questions.length}</h3>
    <p style="font-size: 18px; margin: 20px 0; line-height: 1.6;">${question.title}</p>
  `;
  
  elements.answersContainer.innerHTML = '';
  question.options.forEach((option, index) => {
    const isSelected = examData.studentAnswers[questionId] === option;
    const div = document.createElement('div');
    div.className = `answer-option ${isSelected ? 'selected' : ''}`;
    div.innerHTML = `
      <input type="radio" name="answer" value="${option}" ${isSelected ? 'checked' : ''}>
      <span>${option}</span>
    `;
    div.addEventListener('click', () => {
      selectAnswer(questionId, option);
    });
    elements.answersContainer.appendChild(div);
  });
  
  updateNavigationButtons();
}

function selectAnswer(questionId, answer) {
  examData.studentAnswers[questionId] = answer;
  renderQuestion(questionId);
  socket.emit('submitAnswer', {
    questionNumber: questionId,
    answer: answer
  });
  logActivity(`Answered Question ${questionId}`);
}

function updateNavigationButtons() {
  const totalQuestions = examData.questions.length;
  elements.previousBtn.disabled = examData.currentQuestion === 1;
  elements.nextBtn.disabled = examData.currentQuestion === totalQuestions;
  
  if (examData.currentQuestion === 1) {
    elements.previousBtn.style.opacity = '0.5';
  } else {
    elements.previousBtn.style.opacity = '1';
  }
  
  if (examData.currentQuestion === totalQuestions) {
    elements.nextBtn.style.opacity = '0.5';
  } else {
    elements.nextBtn.style.opacity = '1';
  }
}

function renderQuestionList() {
  elements.questionsList.innerHTML = '';
  examData.questions.forEach(q => {
    const btn = document.createElement('button');
    btn.className = 'question-btn';
    if (q.id === examData.currentQuestion) btn.classList.add('active');
    if (examData.flaggedQuestions.has(q.id)) btn.classList.add('flagged');
    btn.textContent = q.id;
    btn.addEventListener('click', () => goToQuestion(q.id));
    elements.questionsList.appendChild(btn);
  });
}

function goToQuestion(questionId) {
  examData.currentQuestion = questionId;
  renderQuestion(questionId);
  renderQuestionList();
}

function toggleFlag() {
  const questionId = examData.currentQuestion;
  if (examData.flaggedQuestions.has(questionId)) {
    examData.flaggedQuestions.delete(questionId);
    elements.flagBtn.classList.remove('flagged');
    logActivity(`Unflagged Question ${questionId}`);
    socket.emit('flagActivity', {
      type: 'unflagged',
      details: `Question ${questionId} unflagged`
    });
  } else {
    examData.flaggedQuestions.add(questionId);
    elements.flagBtn.classList.add('flagged');
    logActivity(`Flagged Question ${questionId}`);
    socket.emit('flagActivity', {
      type: 'flagged',
      details: `Question ${questionId} flagged for review`
    });
  }
  renderQuestionList();
}

function logActivity(message) {
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const p = document.createElement('p');
  p.textContent = `[${time}] ${message}`;
  elements.activityLog.appendChild(p);
  elements.activityLog.scrollTop = elements.activityLog.scrollHeight;
}

elements.previousBtn.addEventListener('click', () => {
  if (examData.currentQuestion > 1) {
    goToQuestion(examData.currentQuestion - 1);
  }
});

elements.nextBtn.addEventListener('click', () => {
  if (examData.currentQuestion < examData.questions.length) {
    goToQuestion(examData.currentQuestion + 1);
  }
});

elements.flagBtn.addEventListener('click', toggleFlag);

function startExam() {
  const studentName = elements.studentName.value.trim();
  const studentEmail = elements.studentEmail.value.trim();
  const examTitle = elements.examTitle.value.trim();
  const duration = parseInt(elements.duration.value);
  const webcamEnabled = elements.webcamEnabled.checked;
  
  if (!studentName || !studentEmail || !examTitle || !duration) {
    showWarning('Please fill in all fields');
    return;
  }
  
  examData.startTime = new Date();
  examData.duration = duration;
  examData.examActive = true;
  
  socket.emit('startExam', {
    studentName,
    studentEmail,
    examTitle,
    duration,
    webcamEnabled
  });
  
  logActivity(`Exam "${examTitle}" started`);
  logActivity(`Duration: ${duration} minutes`);
  if (webcamEnabled) {
    logActivity('Webcam monitoring enabled');
    elements.webcamStatus.classList.remove('webcam-off');
    elements.webcamStatus.classList.add('webcam-on');
    elements.webcamStatus.innerHTML = '<i class="fas fa-video"></i> Webcam On';
  }
}

socket.on('examStarted', (data) => {
  examData.examId = data.examId;
  
  elements.loginContainer.classList.add('hidden');
  elements.examContainer.classList.remove('hidden');
  
  elements.examTitleDisplay.textContent = elements.examTitle.value;
  elements.studentInfo.textContent = `${elements.studentName.value} | ${elements.studentEmail.value}`;
  
  renderQuestionList();
  renderQuestion(1);
  updateTimer();
});

function submitExam() {
  examData.examActive = false;
  
  let score = 0;
  Object.entries(examData.studentAnswers).forEach(([qId, answer]) => {
    const question = examData.questions.find(q => q.id === parseInt(qId));
    if (question && question.correct === answer) {
      score++;
    }
  });
  
  const answered = Object.keys(examData.studentAnswers).length;
  
  socket.emit('submitExam', {
    totalQuestions: examData.questions.length,
    answered: answered,
    score: score
  });
  
  logActivity('Exam submitted');
}

socket.on('resultGenerated', (data) => {
  elements.examContainer.classList.add('hidden');
  elements.resultContainer.classList.remove('hidden');
  
  elements.scorePercentage.textContent = data.percentage + '%';
  elements.totalQuestions.textContent = data.totalQuestions;
  elements.correctAnswers.textContent = data.score;
  elements.accuracy.textContent = data.percentage + '%';
  elements.flagsCount.textContent = data.flags;
});

elements.submitExamBtn.addEventListener('click', () => {
  const confirmed = confirm('Are you sure you want to submit the exam? You cannot change answers after submission.');
  if (confirmed) {
    submitExam();
  }
});

elements.retakeBtn.addEventListener('click', () => {
  location.reload();
});

elements.loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  startExam();
});

document.addEventListener('keydown', (e) => {
  if (!examData.examActive) return;
  
  if (e.key === 'ArrowLeft' && examData.currentQuestion > 1) {
    goToQuestion(examData.currentQuestion - 1);
  } else if (e.key === 'ArrowRight' && examData.currentQuestion < examData.questions.length) {
    goToQuestion(examData.currentQuestion + 1);
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  if (examData.examActive) {
    showWarning('Connection lost. Your exam may be affected.');
  }
});
