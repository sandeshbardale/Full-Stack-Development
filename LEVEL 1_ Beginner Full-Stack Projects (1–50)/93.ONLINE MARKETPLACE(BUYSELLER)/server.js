const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let users = [
  { id: 1, name: 'John Seller', email: 'seller@example.com', type: 'seller', password: 'pass123' },
  { id: 2, name: 'Jane Buyer', email: 'buyer@example.com', type: 'buyer', password: 'pass123' }
];

let products = [
  { id: 1, name: 'Wireless Headphones', price: 79.99, seller: 'John Seller', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', category: 'Electronics', rating: 4.5, reviews: 120, sellerId: 1 },
  { id: 2, name: 'Smart Watch', price: 249.99, seller: 'John Seller', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', category: 'Electronics', rating: 4.8, reviews: 95, sellerId: 1 },
  { id: 3, name: 'USB-C Cable', price: 12.99, seller: 'John Seller', image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500', category: 'Accessories', rating: 4.2, reviews: 340, sellerId: 1 },
  { id: 4, name: 'Laptop Stand', price: 39.99, seller: 'John Seller', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', category: 'Accessories', rating: 4.6, reviews: 210, sellerId: 1 },
  { id: 5, name: 'Mechanical Keyboard', price: 129.99, seller: 'John Seller', image: 'https://images.unsplash.com/photo-1587829191301-5f8dd21e92fd?w=500', category: 'Electronics', rating: 4.7, reviews: 180, sellerId: 1 },
  { id: 6, name: 'Portable Charger', price: 45.99, seller: 'John Seller', image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', category: 'Accessories', rating: 4.4, reviews: 260, sellerId: 1 }
];

let cart = [];
let orders = [];
let currentUser = null;

app.post('/api/login', (req, res) => {
  const { email, password, userType } = req.body;
  const user = users.find(u => u.email === email && u.password === password && u.type === userType);
  
  if (user) {
    currentUser = user;
    res.json({ success: true, user });
  } else {
    res.json({ success: false, message: 'Invalid credentials' });
  }
});

app.post('/api/logout', (req, res) => {
  currentUser = null;
  res.json({ success: true });
});

app.get('/api/user', (req, res) => {
  res.json(currentUser);
});

app.get('/api/products', (req, res) => {
  const { search, category, minPrice, maxPrice } = req.query;
  
  let filtered = [...products];
  
  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  }
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (minPrice) {
    filtered = filtered.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
  }
  
  res.json(filtered);
});

app.get('/api/product/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  res.json(product);
});

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);
  
  if (product) {
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    res.json({ success: true, cart });
  } else {
    res.json({ success: false });
  }
});

app.get('/api/cart', (req, res) => {
  res.json(cart);
});

app.post('/api/cart/remove', (req, res) => {
  const { productId } = req.body;
  cart = cart.filter(item => item.id !== productId);
  res.json(cart);
});

app.post('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  const item = cart.find(c => c.id === productId);
  if (item) {
    if (quantity <= 0) {
      cart = cart.filter(c => c.id !== productId);
    } else {
      item.quantity = quantity;
    }
  }
  res.json(cart);
});

app.post('/api/checkout', (req, res) => {
  if (cart.length === 0) {
    res.json({ success: false, message: 'Cart is empty' });
    return;
  }
  
  const order = {
    id: orders.length + 1,
    buyer: currentUser.name,
    items: cart,
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    status: 'Pending',
    date: new Date()
  };
  
  orders.push(order);
  cart = [];
  res.json({ success: true, order });
});

app.get('/api/orders', (req, res) => {
  const userOrders = orders.filter(o => o.buyer === currentUser.name);
  res.json(userOrders);
});

app.post('/api/product/add', (req, res) => {
  if (!currentUser || currentUser.type !== 'seller') {
    res.json({ success: false, message: 'Unauthorized' });
    return;
  }
  
  const newProduct = {
    id: products.length + 1,
    ...req.body,
    sellerId: currentUser.id,
    seller: currentUser.name,
    rating: 0,
    reviews: 0
  };
  
  products.push(newProduct);
  res.json({ success: true, product: newProduct });
});

app.get('/api/seller-products', (req, res) => {
  if (!currentUser || currentUser.type !== 'seller') {
    res.json({ success: false, message: 'Unauthorized' });
    return;
  }
  
  const sellerProducts = products.filter(p => p.sellerId === currentUser.id);
  res.json(sellerProducts);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
