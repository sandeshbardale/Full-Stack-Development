const API_BASE = 'http://localhost:3000/api';
let allBugs = [];
let currentFilter = 'all';
let selectedBugId = null;

document.getElementById('bugForm').addEventListener('submit', handleAddBug);
document.querySelectorAll('input[name="filter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        displayBugs(filterBugs());
    });
});

document.querySelector('.close').addEventListener('click', closeModal);
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('markResolvedBtn').addEventListener('click', handleMarkResolved);
document.getElementById('deleteBugBtn').addEventListener('click', handleDeleteBug);

window.addEventListener('click', (event) => {
    const modal = document.getElementById('modal');
    if (event.target == modal) closeModal();
});

async function handleAddBug(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const severity = document.getElementById('severity').value;
    const assignee = document.getElementById('assignee').value;

    if (!title || !description || !severity || !assignee) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/bugs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title,
                description,
                severity,
                assignee,
                status: 'open',
                createdAt: new Date().toISOString()
            })
        });

        if (response.ok) {
            document.getElementById('bugForm').reset();
            fetchBugs();
        }
    } catch (error) {
        console.error('Error adding bug:', error);
    }
}

async function fetchBugs() {
    try {
        const response = await fetch(`${API_BASE}/bugs`);
        if (response.ok) {
            allBugs = await response.json();
            displayBugs(filterBugs());
            updateStats();
        }
    } catch (error) {
        console.error('Error fetching bugs:', error);
    }
}

function filterBugs() {
    if (currentFilter === 'all') return allBugs;
    return allBugs.filter(bug => bug.status === currentFilter);
}

function displayBugs(bugs) {
    const bugsList = document.getElementById('bugsList');
    const emptyState = document.getElementById('emptyState');

    if (bugs.length === 0) {
        bugsList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    bugsList.innerHTML = bugs.map(bug => `
        <div class="bug-card ${bug.severity.toLowerCase()}" onclick="openBugModal(${bug.id})">
            <div class="bug-header">
                <div class="bug-title">${escapeHtml(bug.title)}</div>
                <span class="severity-badge ${bug.severity.toLowerCase()}">${bug.severity}</span>
            </div>
            <div class="bug-description">${escapeHtml(bug.description)}</div>
            <div class="bug-meta">
                <span class="bug-assignee">👤 ${escapeHtml(bug.assignee)}</span>
                <span class="status-badge ${bug.status}">${bug.status.toUpperCase()}</span>
                <span>📅 ${new Date(bug.createdAt).toLocaleDateString()}</span>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    document.getElementById('totalBugs').textContent = allBugs.length;
    document.getElementById('criticalCount').textContent = allBugs.filter(b => b.severity === 'Critical').length;
    document.getElementById('highCount').textContent = allBugs.filter(b => b.severity === 'High').length;
    document.getElementById('mediumCount').textContent = allBugs.filter(b => b.severity === 'Medium').length;
    document.getElementById('lowCount').textContent = allBugs.filter(b => b.severity === 'Low').length;
}

function openBugModal(bugId) {
    const bug = allBugs.find(b => b.id === bugId);
    if (!bug) return;

    selectedBugId = bugId;
    document.getElementById('modalTitle').textContent = bug.title;
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <p><strong>Severity:</strong> <span class="severity-badge ${bug.severity.toLowerCase()}">${bug.severity}</span></p>
        <p><strong>Status:</strong> <span class="status-badge ${bug.status}">${bug.status.toUpperCase()}</span></p>
        <p><strong>Assigned To:</strong> ${escapeHtml(bug.assignee)}</p>
        <p><strong>Created:</strong> ${new Date(bug.createdAt).toLocaleString()}</p>
        <p><strong>Description:</strong></p>
        <p style="background: #f3f4f6; padding: 12px; border-radius: 8px; line-height: 1.6;">${escapeHtml(bug.description)}</p>
    `;

    const markResolvedBtn = document.getElementById('markResolvedBtn');
    if (bug.status === 'closed') {
        markResolvedBtn.style.display = 'none';
    } else {
        markResolvedBtn.style.display = 'block';
    }

    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
    selectedBugId = null;
}

async function handleMarkResolved() {
    if (!selectedBugId) return;

    try {
        const response = await fetch(`${API_BASE}/bugs/${selectedBugId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'closed' })
        });

        if (response.ok) {
            closeModal();
            fetchBugs();
        }
    } catch (error) {
        console.error('Error marking bug as resolved:', error);
    }
}

async function handleDeleteBug() {
    if (!selectedBugId) return;

    if (!confirm('Are you sure you want to delete this bug?')) return;

    try {
        const response = await fetch(`${API_BASE}/bugs/${selectedBugId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            closeModal();
            fetchBugs();
        }
    } catch (error) {
        console.error('Error deleting bug:', error);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

fetchBugs();
setInterval(fetchBugs, 5000);
