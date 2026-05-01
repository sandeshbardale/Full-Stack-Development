const inventoryDiv = document.getElementById('inventory');
const addBtn = document.getElementById('addBtn');

const nameInput = document.getElementById('name');
const quantityInput = document.getElementById('quantity');
const priceInput = document.getElementById('price');

function loadItems() {
    fetch('/api/items')
        .then(res => res.json())
        .then(data => {
            inventoryDiv.innerHTML = '';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'item';
                div.innerHTML = `
                    <span>${item.name} | Qty: ${item.quantity} | ₹${item.price}</span>
                    <button onclick="deleteItem(${item.id})">Delete</button>
                `;
                inventoryDiv.appendChild(div);
            });
        });
}

function deleteItem(id) {
    fetch('/api/items/' + id, { method: 'DELETE' })
        .then(() => loadItems());
}

addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const quantity = quantityInput.value;
    const price = priceInput.value;

    if(name && quantity && price){
        fetch('/api/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, quantity, price })
        })
        .then(() => {
            nameInput.value = '';
            quantityInput.value = '';
            priceInput.value = '';
            loadItems();
        });
    }
});

loadItems();