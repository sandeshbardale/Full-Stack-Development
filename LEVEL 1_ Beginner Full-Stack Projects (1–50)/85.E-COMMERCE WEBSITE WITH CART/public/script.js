const productsDiv = document.getElementById('products');
const cartDiv = document.getElementById('cart');
const totalDiv = document.getElementById('total');
const orderBtn = document.getElementById('orderBtn');

let cart = [];

function loadProducts() {
    fetch('/api/products')
        .then(res => res.json())
        .then(data => {
            productsDiv.innerHTML = '';
            data.forEach(product => {
                const div = document.createElement('div');
                div.className = 'product';
                div.innerHTML = `<h3>${product.name}</h3><p>₹${product.price}</p><button onclick="addToCart(${product.id}, '${product.name}', ${product.price})">Add to Cart</button>`;
                productsDiv.appendChild(div);
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
        alert("Order placed successfully!");
        cart = [];
        renderCart();
    });
});

loadProducts();