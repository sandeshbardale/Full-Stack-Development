const API_URL = 'http://localhost:3000/api';

let currentUser = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    balance: 5247.50,
    income: 12450.00,
    expense: 7202.50,
    pending: 250.00
};

let transactions = [
    { id: 1, description: 'Payment to Sarah', amount: -150.00, date: 'Today at 2:30 PM', status: 'completed', type: 'sent' },
    { id: 2, description: 'Salary Received', amount: 3500.00, date: 'Yesterday at 9:00 AM', status: 'completed', type: 'received' }
];

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateDashboard();
});

function initializeApp() {
    fetchUserData();
}

function setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
            updatePageTitle(section);
        });
    });

    document.getElementById('send-form').addEventListener('submit', handleSendMoney);
    
    document.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', handleShare);
    });

    document.querySelectorAll('.recipient-card').forEach(card => {
        card.addEventListener('click', fillRecipientEmail);
    });
}

function switchSection(sectionName) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    document.getElementById(sectionName).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
}

function updatePageTitle(section) {
    const titles = {
        dashboard: 'Dashboard',
        send: 'Send Money',
        receive: 'Receive Money',
        transactions: 'Transaction History',
        profile: 'Profile Settings'
    };
    document.getElementById('page-title').textContent = titles[section] || 'Dashboard';
}

function updateDashboard() {
    document.getElementById('balance-display').textContent = `$${formatNumber(currentUser.balance)}`;
    document.getElementById('income-display').textContent = `$${formatNumber(currentUser.income)}`;
    document.getElementById('expense-display').textContent = `$${formatNumber(currentUser.expense)}`;
    document.getElementById('pending-display').textContent = `$${formatNumber(currentUser.pending)}`;
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-email').textContent = currentUser.email;
}

function formatNumber(num) {
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function handleSendMoney(e) {
    e.preventDefault();
    
    const recipientEmail = document.getElementById('recipient-email').value;
    const amount = parseFloat(document.getElementById('send-amount').value);
    const description = document.getElementById('send-description').value;

    if (!recipientEmail || !amount || amount <= 0) {
        showNotification('Please fill all fields correctly', 'error');
        return;
    }

    if (amount > currentUser.balance) {
        showNotification('Insufficient balance', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ recipientEmail, amount, description })
        });

        const data = await response.json();

        if (response.ok) {
            currentUser.balance -= amount;
            currentUser.expense += amount;
            
            const transaction = {
                id: transactions.length + 1,
                description: `Payment to ${recipientEmail}`,
                amount: -amount,
                date: new Date().toLocaleString(),
                status: 'completed',
                type: 'sent'
            };
            transactions.unshift(transaction);

            updateDashboard();
            document.getElementById('send-form').reset();
            showNotification('Money sent successfully!');
            switchSection('dashboard');
        } else {
            showNotification(data.message || 'Failed to send money', 'error');
        }
    } catch (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

function fillRecipientEmail(e) {
    const email = e.currentTarget.querySelector('.recipient-email').textContent;
    document.getElementById('recipient-email').value = email;
    document.getElementById('send-amount').focus();
}

function handleShare(e) {
    const code = document.getElementById('receive-code').textContent;
    const text = e.target.textContent;
    
    if (text.includes('Copy Link')) {
        copyCode();
    } else {
        showNotification(`Sharing via ${text.split(' ')[1]}...`);
    }
}

function copyCode() {
    const code = document.getElementById('receive-code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('Code copied to clipboard!');
    });
}

async function fetchUserData() {
    try {
        const response = await fetch(`${API_URL}/user`);
        const data = await response.json();
        
        if (response.ok) {
            currentUser = { ...currentUser, ...data };
            updateDashboard();
        }
    } catch (error) {
        console.log('Using local user data');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = 'notification show ' + (type === 'error' ? 'error' : '');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function getTransactionIcon(type) {
    return type === 'sent' ? '↗️' : '↙️';
}

function formatDate(date) {
    return new Date(date).toLocaleString();
}
