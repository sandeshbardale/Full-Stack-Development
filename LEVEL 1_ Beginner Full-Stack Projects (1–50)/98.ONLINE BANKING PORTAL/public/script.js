let currentUser = null;

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (data.success) {
      currentUser = data.user;
      showDashboard();
      loadTransactions();
      updateDateTime();
      setInterval(updateDateTime, 1000);
    } else {
      alert('Invalid credentials. Try: john@bank.com / pass123');
    }
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
});

function showDashboard() {
  document.getElementById('loginContainer').classList.remove('active');
  document.getElementById('dashboardContainer').classList.add('active');
  document.getElementById('displayName').textContent = currentUser.name.split(' ')[0];
  document.getElementById('userName').textContent = currentUser.name;
  document.getElementById('balanceAmount').textContent = currentUser.balance.toFixed(2);
  document.getElementById('accountNumber').textContent = currentUser.accountNumber;
}

async function loadTransactions() {
  try {
    const response = await fetch(`http://localhost:3000/api/transactions?email=${currentUser.email}`);
    const data = await response.json();
    const list = document.getElementById('transactionsList');
    
    if (data.transactions.length === 0) {
      list.innerHTML = '<p class="no-data">No transactions yet</p>';
      return;
    }

    list.innerHTML = data.transactions.map(t => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-icon">${getIcon(t.type)}</div>
          <div class="transaction-details">
            <h4>${t.type}</h4>
            <p>${t.description}</p>
          </div>
        </div>
        <div class="transaction-amount ${t.type === 'Deposit' ? 'amount-positive' : 'amount-negative'}">
          ${t.type === 'Deposit' ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Failed to load transactions:', error);
  }
}

function getIcon(type) {
  const icons = {
    'Deposit': '📥',
    'Withdrawal': '🏧',
    'Transfer': '💸',
    'Bill Payment': '📄'
  };
  return icons[type] || '💰';
}

function updateDateTime() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  document.getElementById('dateTime').textContent = now.toLocaleDateString('en-US', options);
}

document.getElementById('transferBtn').addEventListener('click', () => {
  openModal('Transfer Money', 'transfer');
});

document.getElementById('depositBtn').addEventListener('click', () => {
  openModal('Deposit Money', 'deposit');
});

document.getElementById('transactionsBtn').addEventListener('click', () => {
  loadTransactions();
  alert('Transaction history displayed above');
});

function openModal(title, type) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalOverlay').classList.add('active');
  document.getElementById('recipientGroup').style.display = type === 'transfer' ? 'block' : 'none';
  
  document.getElementById('actionForm').onsubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('actionAmount').value);
    
    let endpoint, body;
    if (type === 'transfer') {
      const recipient = document.getElementById('recipientEmail').value;
      endpoint = '/api/transfer';
      body = { email: currentUser.email, amount, recipient };
    } else {
      endpoint = '/api/deposit';
      body = { email: currentUser.email, amount };
    }

    try {
      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (data.success) {
        currentUser.balance = data.newBalance;
        document.getElementById('balanceAmount').textContent = data.newBalance.toFixed(2);
        closeModal();
        loadTransactions();
        alert(`${type === 'transfer' ? 'Transfer' : 'Deposit'} successful!`);
      } else {
        alert('Transaction failed: ' + data.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
  document.getElementById('actionForm').reset();
}

document.querySelector('.modal-close').addEventListener('click', closeModal);

document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modalOverlay')) {
    closeModal();
  }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  currentUser = null;
  document.getElementById('loginContainer').classList.add('active');
  document.getElementById('dashboardContainer').classList.remove('active');
  document.getElementById('loginForm').reset();
});