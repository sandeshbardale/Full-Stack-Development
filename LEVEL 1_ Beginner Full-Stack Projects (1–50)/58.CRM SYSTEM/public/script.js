const listDiv = document.getElementById('list');
const addBtn = document.getElementById('addBtn');

const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');

function loadCustomers() {
    fetch('/api/customers')
        .then(res => res.json())
        .then(data => {
            listDiv.innerHTML = '';
            data.forEach(c => {
                const div = document.createElement('div');
                div.className = 'item';
                div.innerHTML = `
                    <span>${c.name} | ${c.email} | ${c.phone}</span>
                    <button onclick="deleteCustomer(${c.id})">Delete</button>
                `;
                listDiv.appendChild(div);
            });
        });
}

function deleteCustomer(id) {
    fetch('/api/customers/' + id, { method: 'DELETE' })
        .then(() => loadCustomers());
}

addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if(name && email && phone){
        fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone })
        })
        .then(() => {
            nameInput.value = '';
            emailInput.value = '';
            phoneInput.value = '';
            loadCustomers();
        });
    }
});

loadCustomers();