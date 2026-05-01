const menuDiv = document.getElementById('menu');
const cartDiv = document.getElementById('cart');
const totalDiv = document.getElementById('total');
const orderBtn = document.getElementById('orderBtn');

let cart = [];

function loadMenu() {
    fetch('/api/menu')
        .then(res => res.json())
        .then(data => {
            menuDiv.innerHTML = '';
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'item';
                div.innerHTML = `<h3>${item.name}</h3><p>₹${item.price}</p><button onclick="addToCart(${item.id}, '${item.name}', ${item.price})">Add</button>`;
                menuDiv.appendChild(div);
            });
        });
}

function addToCart(id, name, price) {
    cart.push({ id, name, price });
    renderCart();
}

function renderCart() {
    cartDiv.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
        total += item.price;
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `<span>${item.name}</span><span>₹${item.price}</span>`;
        cartDiv.appendChild(div);
    });
    totalDiv.innerText = "Total: ₹" + total;
}

orderBtn.addEventListener('click', () => {
    if(cart.length === 0) return;
    let total = cart.reduce((sum, item) => sum + item.price, 0);

    fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart, total })
    })
    .then(res => res.json())
    .then(data => {
        alert("Order placed!");
        cart = [];
        renderCart();
    });
});

loadMenu();