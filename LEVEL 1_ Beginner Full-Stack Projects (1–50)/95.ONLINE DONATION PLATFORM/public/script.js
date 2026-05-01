const API_BASE = 'http://localhost:3000/api';

let causes = [];
let donations = [];
let selectedCause = null;

const initApp = async () => {
  await loadCauses();
  await loadDonations();
  await loadStats();
  setupEventListeners();
  renderCauses();
  updateRecentDonations();
};

const loadCauses = async () => {
  try {
    const response = await fetch(`${API_BASE}/causes`);
    causes = await response.json();
  } catch (error) {
    console.error('Error loading causes:', error);
  }
};

const loadDonations = async () => {
  try {
    const response = await fetch(`${API_BASE}/donations`);
    const data = await response.json();
    donations = data.donations || [];
  } catch (error) {
    console.error('Error loading donations:', error);
  }
};

const loadStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/stats`);
    const stats = await response.json();
    document.getElementById('totalRaised').textContent = `$${stats.totalDonations.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('donorCount').textContent = stats.donorCount;
    document.getElementById('avgDonation').textContent = stats.averageDonation;
    document.getElementById('maxDonation').textContent = stats.highestDonation;
  } catch (error) {
    console.error('Error loading stats:', error);
  }
};

const renderCauses = () => {
  const grid = document.getElementById('causesGrid');
  const causeSelect = document.getElementById('cause');

  grid.innerHTML = causes.map(cause => `
    <div class="cause-card" onclick="selectCause(${cause.id})">
      <div class="cause-icon">${cause.icon}</div>
      <h3>${cause.name}</h3>
      <p>${cause.description}</p>
    </div>
  `).join('');

  causeSelect.innerHTML = '<option value="">Choose a cause...</option>' + causes.map(cause => `
    <option value="${cause.id}">${cause.icon} ${cause.name}</option>
  `).join('');
};

const selectCause = (causeId) => {
  selectedCause = causeId;
  document.getElementById('cause').value = causeId;
};

const setupEventListeners = () => {
  const form = document.getElementById('donationForm');
  const amountInput = document.getElementById('amount');
  const quickBtns = document.querySelectorAll('.quick-btn');

  quickBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const amount = btn.dataset.amount;
      amountInput.value = amount;
      quickBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateSummary();
    });
  });

  amountInput.addEventListener('input', updateSummary);

  form.addEventListener('submit', handleDonation);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
};

const updateSummary = () => {
  const amount = parseFloat(document.getElementById('amount').value) || 0;
  document.getElementById('summaryAmount').textContent = amount.toFixed(2);
  document.getElementById('summaryTotal').textContent = (amount * 1.02).toFixed(2);
};

const handleDonation = async (e) => {
  e.preventDefault();

  const cause = document.getElementById('cause').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  if (!cause || !amount || !name || !email) {
    showErrorModal('Please fill in all required fields');
    return;
  }

  const causeName = causes.find(c => c.id === parseInt(cause))?.name || 'General';

  try {
    const response = await fetch(`${API_BASE}/donate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cause: causeName,
        amount,
        name,
        email,
        message,
      }),
    });

    if (!response.ok) {
      throw new Error('Donation failed');
    }

    const result = await response.json();

    document.getElementById('donationForm').reset();
    document.querySelectorAll('.quick-btn').forEach(b => b.classList.remove('active'));

    await loadDonations();
    await loadStats();
    updateRecentDonations();
    updateSummary();

    showSuccessModal(result.donation);
  } catch (error) {
    console.error('Error submitting donation:', error);
    showErrorModal('Failed to process donation. Please try again.');
  }
};

const updateRecentDonations = () => {
  const list = document.getElementById('recentDonationsList');
  const recent = donations.slice(-5).reverse();

  if (recent.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: #999;">No donations yet. Be the first!</p>';
    return;
  }

  list.innerHTML = recent.map(donation => `
    <div class="donation-item">
      <div class="donation-item-name">${donation.name}</div>
      <div class="donation-item-amount">$${donation.amount.toFixed(2)}</div>
      <div class="donation-item-cause">${donation.cause}</div>
    </div>
  `).join('');
};

const showSuccessModal = (donation) => {
  const modal = document.getElementById('successModal');
  const details = document.getElementById('modalDonationDetails');

  const causeIcon = causes.find(c => c.name === donation.cause)?.icon || '💝';

  details.innerHTML = `
    <div class="detail-row">
      <strong>Donation Amount:</strong>
      <span>$${donation.amount.toFixed(2)}</span>
    </div>
    <div class="detail-row">
      <strong>Cause:</strong>
      <span>${causeIcon} ${donation.cause}</span>
    </div>
    <div class="detail-row">
      <strong>Donor:</strong>
      <span>${donation.name}</span>
    </div>
  `;

  modal.classList.add('active');
};

const showErrorModal = (message) => {
  document.getElementById('errorMessage').textContent = message;
  document.getElementById('errorModal').classList.add('active');
};

const closeModal = () => {
  document.getElementById('successModal').classList.remove('active');
};

const closeErrorModal = () => {
  document.getElementById('errorModal').classList.remove('active');
};

document.addEventListener('DOMContentLoaded', initApp);
