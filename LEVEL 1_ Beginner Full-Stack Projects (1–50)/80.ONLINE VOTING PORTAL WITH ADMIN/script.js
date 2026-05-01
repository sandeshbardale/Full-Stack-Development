let currentUser = null;
let userType = null;
let polls = [];
let voters = [];
let votes = [];

const navBtns = document.querySelectorAll('.nav-btn');
const voterSection = document.getElementById('voter-section');
const adminSection = document.getElementById('admin-section');
const voterLoginForm = document.getElementById('voterLoginForm');
const adminLoginForm = document.getElementById('adminLoginForm');
const createPollForm = document.getElementById('createPollForm');
const addOptionBtn = document.getElementById('addOptionBtn');
const logoutBtn = document.getElementById('logoutBtn');
const modal = document.getElementById('pollModal');
const closeBtn = document.querySelector('.close');

navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        navBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        
        voterSection.classList.remove('active');
        adminSection.classList.remove('active');
        
        if(e.target.dataset.tab === 'voter') {
            voterSection.classList.add('active');
            if(currentUser && userType === 'voter') {
                document.getElementById('voterLogin').style.display = 'none';
                document.getElementById('votingArea').style.display = 'block';
                loadVoterPolls();
            }
        } else {
            adminSection.classList.add('active');
            if(currentUser && userType === 'admin') {
                document.getElementById('adminLogin').style.display = 'none';
                document.getElementById('adminDashboard').style.display = 'block';
                loadAdminDashboard();
            }
        }
    });
});

voterLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const voterId = document.getElementById('voterId').value.trim();
    const password = document.getElementById('voterPassword').value.trim();
    
    if(!voterId || !password) {
        showError('Please fill all fields');
        return;
    }
    
    if(voters.find(v => v.id === voterId && v.password === password)) {
        currentUser = voterId;
        userType = 'voter';
        document.getElementById('voterLogin').style.display = 'none';
        document.getElementById('votingArea').style.display = 'block';
        voterLoginForm.reset();
        loadVoterPolls();
        showSuccess('Logged in successfully!');
    } else {
        showError('Invalid credentials');
    }
});

adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const adminId = document.getElementById('adminId').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    
    if(adminId === 'admin' && password === 'admin123') {
        currentUser = adminId;
        userType = 'admin';
        document.getElementById('adminLogin').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        adminLoginForm.reset();
        loadAdminDashboard();
        showSuccess('Admin logged in successfully!');
    } else {
        showError('Invalid admin credentials');
    }
});

createPollForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('pollTitle').value.trim();
    const description = document.getElementById('pollDescription').value.trim();
    const optionInputs = document.querySelectorAll('.poll-option');
    const options = Array.from(optionInputs)
        .map(input => input.value.trim())
        .filter(val => val);
    
    if(!title || options.length < 2) {
        showError('Poll must have a title and at least 2 options');
        return;
    }
    
    fetch('/api/create-poll', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, description, options})
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            polls.push(data.poll);
            createPollForm.reset();
            
            const optionsContainer = document.getElementById('optionsContainer');
            optionsContainer.innerHTML = `
                <div class="form-group">
                    <label>Option 1</label>
                    <input type="text" class="poll-option" placeholder="Enter option 1" required>
                </div>
                <div class="form-group">
                    <label>Option 2</label>
                    <input type="text" class="poll-option" placeholder="Enter option 2" required>
                </div>
            `;
            
            loadAdminDashboard();
            showSuccess('Poll created successfully!');
        }
    })
    .catch(() => showError('Failed to create poll'));
});

addOptionBtn.addEventListener('click', () => {
    const optionsContainer = document.getElementById('optionsContainer');
    const optionCount = optionsContainer.querySelectorAll('.form-group').length + 1;
    
    const newOption = document.createElement('div');
    newOption.className = 'form-group';
    newOption.innerHTML = `
        <label>Option ${optionCount}</label>
        <input type="text" class="poll-option" placeholder="Enter option ${optionCount}">
    `;
    
    optionsContainer.appendChild(newOption);
});

logoutBtn.addEventListener('click', () => {
    currentUser = null;
    userType = null;
    
    document.getElementById('voterLogin').style.display = 'block';
    document.getElementById('votingArea').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'block';
    document.getElementById('adminDashboard').style.display = 'none';
    
    voterLoginForm.reset();
    adminLoginForm.reset();
    
    navBtns.forEach(btn => btn.classList.remove('active'));
    navBtns[0].classList.add('active');
    
    voterSection.classList.add('active');
    adminSection.classList.remove('active');
    
    showSuccess('Logged out successfully!');
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if(e.target === modal) {
        modal.style.display = 'none';
    }
});

function loadVoterPolls() {
    fetch('/api/get-polls')
        .then(res => res.json())
        .then(data => {
            polls = data.polls || [];
            const pollsList = document.getElementById('pollsList');
            
            if(polls.length === 0) {
                pollsList.innerHTML = '<p style="text-align: center; color: #666;">No active polls available</p>';
                return;
            }
            
            pollsList.innerHTML = polls.map(poll => {
                const userVote = votes.find(v => v.pollId === poll.id && v.voterId === currentUser);
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                
                return `
                    <div class="poll-card">
                        <div class="poll-title">${poll.title}</div>
                        <div class="poll-description">${poll.description}</div>
                        ${userVote ? `
                            <div class="results-section">
                                <div class="results-title">Your vote: ${userVote.option}</div>
                                <div style="margin-top: 1rem;">
                                    ${poll.options.map(opt => {
                                        const percentage = totalVotes > 0 ? (opt.votes / totalVotes * 100).toFixed(1) : 0;
                                        return `
                                            <div class="result-item">
                                                <div class="result-label">
                                                    <span>${opt.name}</span>
                                                    <span>${opt.votes} votes (${percentage}%)</span>
                                                </div>
                                                <div class="result-bar">
                                                    <div class="result-fill" style="width: ${percentage}%"></div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        ` : `
                            <form onsubmit="submitVote(event, '${poll.id}')">
                                <div class="poll-options">
                                    ${poll.options.map((opt, idx) => `
                                        <div class="option">
                                            <input type="radio" id="opt_${poll.id}_${idx}" name="option_${poll.id}" value="${opt.name}" required>
                                            <label for="opt_${poll.id}_${idx}">${opt.name}</label>
                                        </div>
                                    `).join('')}
                                </div>
                                <button type="submit" class="vote-btn">Submit Vote</button>
                            </form>
                        `}
                    </div>
                `;
            }).join('');
        })
        .catch(() => showError('Failed to load polls'));
}

function submitVote(e, pollId) {
    e.preventDefault();
    
    const selectedOption = document.querySelector(`input[name="option_${pollId}"]:checked`).value;
    
    fetch('/api/submit-vote', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({pollId, voterId: currentUser, option: selectedOption})
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
            votes.push({pollId, voterId: currentUser, option: selectedOption});
            loadVoterPolls();
            showSuccess('Vote submitted successfully!');
        }
    })
    .catch(() => showError('Failed to submit vote'));
}

function loadAdminDashboard() {
    fetch('/api/get-stats')
        .then(res => res.json())
        .then(data => {
            document.getElementById('totalVoters').textContent = data.totalVoters || 0;
            document.getElementById('totalVotes').textContent = data.totalVotes || 0;
            document.getElementById('activePollsCount').textContent = data.activePollsCount || 0;
        })
        .catch(() => console.error('Failed to load stats'));
    
    fetch('/api/get-polls')
        .then(res => res.json())
        .then(data => {
            polls = data.polls || [];
            const adminPollsList = document.getElementById('adminPollsList');
            
            if(polls.length === 0) {
                adminPollsList.innerHTML = '<p style="text-align: center; color: #666;">No polls created yet</p>';
                return;
            }
            
            adminPollsList.innerHTML = polls.map(poll => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                
                return `
                    <div class="admin-poll-card">
                        <div class="admin-poll-info">
                            <div class="poll-title">${poll.title}</div>
                            <div class="poll-description">${poll.description}</div>
                            <p style="margin-top: 1rem; color: #666; font-size: 0.9rem;">Total Votes: ${totalVotes}</p>
                            <button class="delete-btn" onclick="deletePoll('${poll.id}')">Delete Poll</button>
                        </div>
                        <div class="admin-poll-results">
                            <h4>Results</h4>
                            ${poll.options.map(opt => {
                                const percentage = totalVotes > 0 ? (opt.votes / totalVotes * 100).toFixed(1) : 0;
                                return `
                                    <div class="result-item">
                                        <div class="result-label">
                                            <span>${opt.name}</span>
                                            <span>${opt.votes} (${percentage}%)</span>
                                        </div>
                                        <div class="result-bar">
                                            <div class="result-fill" style="width: ${percentage}%"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        })
        .catch(() => showError('Failed to load polls'));
}

function deletePoll(pollId) {
    if(confirm('Are you sure you want to delete this poll?')) {
        fetch('/api/delete-poll', {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({pollId})
        })
        .then(res => res.json())
        .then(data => {
            if(data.success) {
                polls = polls.filter(p => p.id !== pollId);
                loadAdminDashboard();
                showSuccess('Poll deleted successfully!');
            }
        })
        .catch(() => showError('Failed to delete poll'));
    }
}

function showSuccess(message) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    document.body.insertBefore(div, document.body.firstChild);
    
    setTimeout(() => div.remove(), 3000);
}

function showError(message) {
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = message;
    document.body.insertBefore(div, document.body.firstChild);
    
    setTimeout(() => div.remove(), 3000);
}

function initializeSampleVoters() {
    if(voters.length === 0) {
        voters = [
            {id: 'voter1', password: 'pass1'},
            {id: 'voter2', password: 'pass2'},
            {id: 'voter3', password: 'pass3'},
            {id: 'voter4', password: 'pass4'},
            {id: 'voter5', password: 'pass5'}
        ];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSampleVoters();
    fetch('/api/get-polls')
        .then(res => res.json())
        .then(data => {
            polls = data.polls || [];
        })
        .catch(() => console.error('Failed to load initial polls'));
});
