let currentUser = null;
let allProducts = [];
let cartItems = [];

const API_BASE = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadProducts();
  checkUserSession();
});

function setupEventListeners() {
  document.getElementById('loginBtn').addEventListener('click', openLoginModal);
  document.getElementById('userBtn').addEventListener('click', toggleUserDropdown);
  document.getElementById('cartBtn').addEventListener('click', openCartModal);
  document.getElementById('searchBtn').addEventListener('click', performSearch);
  document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });

  document.getElementById('categoryFilter').addEventListener('change', applyFilters);
  document.getElementById('priceFilter').addEventListener('input', (e) => {
    document.getElementById('priceDisplay').textContent = 'Max: $' + e.target.value;
    applyFilters();
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const userType = e.target.dataset.tab;
      document.getElementById('userType').value = userType;
      document.getElementById('loginTitle').textContent = 'Login as ' + 
        (userType === 'buyer' ? 'Buyer' : 'Seller');
      document.getElementById('loginHint').textContent = 'Demo: ' + 
        (userType === 'buyer' ? 'buyer@example.com' : 'seller@example.com') + ' / pass123';
    });
  });

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function openLoginModal() {
  document.getElementById('loginModal').classList.add('active');
}

function closeLoginModal() {
  document.getElementById('loginModal').classList.remove('active');
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('active');
}

function openCartModal() {
  if (!currentUser || currentUser.type !== 'buyer') {
    alert('Please login as a buyer to view cart');
    openLoginModal();
    return;
  }
  document.getElementById('cartModal').classList.add('active');
  displayCart();
}

function closeCartModal() {
  document.getElementById('cartModal').classList.remove('active');
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const userType = document.getElementById('userType').value;

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userType })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      closeLoginModal();
      updateNavbar();
      loadProducts();
      
      if (userType === 'seller') {
        goToSellerDash();
      }
    } else {
      alert('Login failed: ' + data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    alert('Login error');
  }

  document.getElementById('loginForm').reset();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  cartItems = [];
  updateNavbar();
  goToHome();
  document.getElementById('userDropdown').classList.remove('active');
}

function updateNavbar() {
  const loginBtn = document.getElementById('loginBtn');
  const userBtn = document.getElementById('userBtn');
  const buyerDashLink = document.getElementById('buyerDashLink');
  const sellerDashLink = document.getElementById('sellerDashLink');

  if (currentUser) {
    loginBtn.style.display = 'none';
    userBtn.style.display = 'block';
    userBtn.textContent = currentUser.name;
    userBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name}`;
    
    if (currentUser.type === 'buyer') {
      buyerDashLink.style.display = 'block';
      sellerDashLink.style.display = 'none';
    } else {
      buyerDashLink.style.display = 'none';
      sellerDashLink.style.display = 'block';
    }
  } else {
    loginBtn.style.display = 'block';
    userBtn.style.display = 'none';
  }
}

function checkUserSession() {
  const stored = localStorage.getItem('currentUser');
  if (stored) {
    currentUser = JSON.parse(stored);
    updateNavbar();
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    allProducts = await response.json();
    displayProducts(allProducts);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function displayProducts(products) {
  const container = document.getElementById('productsList');
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No products found</p>';
    return;
  }

  products.forEach(product => {
    const stars = '★'.repeat(Math.floor(product.rating));
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-category">${product.category}</div>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span>${product.rating} (${product.reviews} reviews)</span>
        </div>
        <div class="product-seller">by ${product.seller}</div>
        <div class="product-price">$${product.price.toFixed(2)}</div>
        <div class="product-actions">
          ${currentUser && currentUser.type === 'buyer' 
            ? `<button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                 <i class="fas fa-cart-plus"></i> Add
               </button>`
            : `<button class="view-btn" onclick="viewProduct(${product.id})">
                 <i class="fas fa-eye"></i> View
               </button>`
          }
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function addToCart(productId) {
  if (!currentUser || currentUser.type !== 'buyer') {
    alert('Please login as a buyer');
    openLoginModal();
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 })
    });

    const data = await response.json();
    if (data.success) {
      updateCartCount();
      alert('Product added to cart!');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
}

async function updateCartCount() {
  try {
    const response = await fetch(`${API_BASE}/cart`);
    cartItems = await response.json();
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelector('.cart-count').textContent = count;
  } catch (error) {
    console.error('Error updating cart count:', error);
  }
}

async function displayCart() {
  try {
    const response = await fetch(`${API_BASE}/cart`);
    const items = await response.json();
    const container = document.getElementById('cartItems');
    container.innerHTML = '';

    if (items.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999;">Your cart is empty</p>';
      document.getElementById('subtotal').textContent = '$0.00';
      document.getElementById('cartTotal').textContent = '$10.00';
      return;
    }

    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.price * item.quantity;
      const itemDiv = document.createElement('div');
      itemDiv.className = 'cart-item';
      itemDiv.innerHTML = `
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div class="cart-item-quantity">
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
          <span>${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
        </div>
        <button onclick="removeFromCart(${item.id})" style="background: #e74c3c; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
          <i class="fas fa-trash"></i>
        </button>
      `;
      container.appendChild(itemDiv);
    });

    document.getElementById('subtotal').textContent = '$' + subtotal.toFixed(2);
    document.getElementById('cartTotal').textContent = '$' + (subtotal + 10).toFixed(2);
  } catch (error) {
    console.error('Error displaying cart:', error);
  }
}

async function updateQuantity(productId, newQuantity) {
  try {
    const response = await fetch(`${API_BASE}/cart/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: newQuantity })
    });

    await response.json();
    displayCart();
    updateCartCount();
  } catch (error) {
    console.error('Error updating quantity:', error);
  }
}

async function removeFromCart(productId) {
  try {
    const response = await fetch(`${API_BASE}/cart/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });

    await response.json();
    displayCart();
    updateCartCount();
  } catch (error) {
    console.error('Error removing from cart:', error);
  }
}

async function checkout() {
  if (!currentUser || currentUser.type !== 'buyer') {
    alert('Please login as a buyer');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await response.json();
    if (data.success) {
      alert('Order placed successfully! Order ID: #' + data.order.id);
      closeCartModal();
      updateCartCount();
      displayCart();
      goToBuyerDash();
    } else {
      alert('Checkout failed: ' + data.message);
    }
  } catch (error) {
    console.error('Checkout error:', error);
  }
}

function performSearch() {
  const searchTerm = document.getElementById('searchInput').value;
  const category = document.getElementById('categoryFilter').value;
  const maxPrice = document.getElementById('priceFilter').value;

  const filtered = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    const matchesPrice = p.price <= parseFloat(maxPrice);
    return matchesSearch && matchesCategory && matchesPrice;
  });

  displayProducts(filtered);
}

function applyFilters() {
  performSearch();
}

function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionId).classList.add('active');
  document.getElementById('userDropdown').classList.remove('active');
}

function goToHome() {
  showSection('homeSection');
  loadProducts();
}

async function goToBuyerDash() {
  if (!currentUser || currentUser.type !== 'buyer') {
    alert('Please login as a buyer');
    return;
  }

  showSection('buyerDashSection');

  try {
    const response = await fetch(`${API_BASE}/orders`);
    const orders = await response.json();

    const response2 = await fetch(`${API_BASE}/cart`);
    const cart = await response2.json();

    const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('cartItemsCount').textContent = 
      cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('totalSpent').textContent = '$' + totalSpent.toFixed(2);

    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    if (orders.length === 0) {
      ordersList.innerHTML = '<p style="text-align: center; color: #999;">No orders yet</p>';
    } else {
      orders.slice(-3).reverse().forEach(order => {
        const items = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
          <div class="order-header">
            <div>
              <div class="order-id">Order #${order.id}</div>
              <div class="order-details">${new Date(order.date).toLocaleDateString()}</div>
            </div>
            <span class="order-status pending">${order.status}</span>
          </div>
          <div class="order-items">
            ${order.items.map(i => 
              `<div class="order-item-line">${i.name} × ${i.quantity} = $${(i.price * i.quantity).toFixed(2)}</div>`
            ).join('')}
          </div>
          <div style="margin-top: 10px; font-weight: bold;">Total: $${order.total.toFixed(2)}</div>
        `;
        ordersList.appendChild(orderDiv);
      });
    }
  } catch (error) {
    console.error('Error loading buyer dashboard:', error);
  }
}

async function goToSellerDash() {
  if (!currentUser || currentUser.type !== 'seller') {
    alert('Please login as a seller');
    return;
  }

  showSection('sellerDashSection');

  try {
    const response = await fetch(`${API_BASE}/seller-products`);
    const sellerProducts = await response.json();

    const container = document.getElementById('sellerProductsList');
    container.innerHTML = '';

    if (sellerProducts.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999;">No products yet</p>';
    } else {
      sellerProducts.forEach(product => {
        const stars = '★'.repeat(Math.floor(product.rating));
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-category">${product.category}</div>
            <div class="product-rating">
              <span class="stars">${stars}</span>
              <span>${product.rating}</span>
            </div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <div class="product-actions">
              <button class="delete-btn" onclick="deleteProduct(${product.id})">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }
  } catch (error) {
    console.error('Error loading seller dashboard:', error);
  }
}

function showAddProductForm() {
  document.getElementById('addProductForm').style.display = 'block';
}

function hideAddProductForm() {
  document.getElementById('addProductForm').style.display = 'none';
  document.getElementById('addProductForm').reset();
}

async function addProduct(e) {
  e.preventDefault();

  if (!currentUser || currentUser.type !== 'seller') {
    alert('Please login as a seller');
    return;
  }

  const newProduct = {
    name: document.getElementById('productName').value,
    price: parseFloat(document.getElementById('productPrice').value),
    category: document.getElementById('productCategory').value,
    image: document.getElementById('productImage').value
  };

  try {
    const response = await fetch(`${API_BASE}/product/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProduct)
    });

    const data = await response.json();
    if (data.success) {
      alert('Product added successfully!');
      hideAddProductForm();
      goToSellerDash();
    } else {
      alert('Failed to add product');
    }
  } catch (error) {
    console.error('Error adding product:', error);
  }
}

async function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    alert('Product deletion feature would be implemented with additional backend support');
  }
}

async function goToOrders() {
  if (!currentUser || currentUser.type !== 'buyer') {
    alert('Please login as a buyer');
    return;
  }

  showSection('ordersSection');

  try {
    const response = await fetch(`${API_BASE}/orders`);
    const orders = await response.json();

    const ordersList = document.getElementById('allOrdersList');
    ordersList.innerHTML = '';

    if (orders.length === 0) {
      ordersList.innerHTML = '<p style="text-align: center; color: #999;">No orders found</p>';
    } else {
      orders.reverse().forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.innerHTML = `
          <div class="order-header">
            <div>
              <div class="order-id">Order #${order.id}</div>
              <div class="order-details">${new Date(order.date).toLocaleDateString()}</div>
            </div>
            <span class="order-status pending">${order.status}</span>
          </div>
          <div class="order-items">
            ${order.items.map(i => 
              `<div class="order-item-line">${i.name} × ${i.quantity} = $${(i.price * i.quantity).toFixed(2)}</div>`
            ).join('')}
          </div>
          <div style="margin-top: 10px; font-weight: bold;">Total: $${order.total.toFixed(2)}</div>
        `;
        ordersList.appendChild(orderDiv);
      });
    }
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

function viewProduct(productId) {
  alert('Product details for ID: ' + productId);
}
