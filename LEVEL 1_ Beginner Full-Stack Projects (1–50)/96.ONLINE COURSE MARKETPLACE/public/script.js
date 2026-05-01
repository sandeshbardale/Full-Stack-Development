let cart = [];
let allCourses = [];

const API_BASE = 'http://localhost:3000/api';

const courseModal = document.getElementById('courseModal');
const cartModal = document.getElementById('cartModal');
const courseModalClose = courseModal.querySelector('.close');
const cartModalClose = cartModal.querySelector('.close');
const coursesGrid = document.getElementById('coursesGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const continueShoppingBtn = document.getElementById('continueShoppingBtn');
const successMessage = document.getElementById('successMessage');
let currentCourseId = null;

async function fetchCourses() {
  try {
    const response = await fetch(`${API_BASE}/courses`);
    allCourses = await response.json();
    displayCourses(allCourses);
    populateCategories();
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
}

async function populateCategories() {
  try {
    const response = await fetch(`${API_BASE}/categories`);
    const categories = await response.json();
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category;
      option.textContent = category;
      categoryFilter.appendChild(option);
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

function displayCourses(courses) {
  coursesGrid.innerHTML = '';
  courses.forEach(course => {
    const courseCard = document.createElement('div');
    courseCard.className = 'course-card';
    courseCard.innerHTML = `
      <img src="${course.image}" alt="${course.title}" class="course-image">
      <div class="course-content">
        <span class="course-category">${course.category}</span>
        <h3 class="course-title">${course.title}</h3>
        <p class="course-instructor">By ${course.instructor}</p>
        <div class="course-meta">
          <div><i class="fas fa-star"></i> ${course.rating}</div>
          <div><i class="fas fa-users"></i> ${course.students.toLocaleString()}</div>
          <div><i class="fas fa-clock"></i> ${course.duration}</div>
        </div>
        <div class="course-footer">
          <div class="course-price">$${course.price}</div>
          <div class="course-rating">${course.level}</div>
        </div>
      </div>
    `;
    courseCard.addEventListener('click', () => openCourseModal(course));
    coursesGrid.appendChild(courseCard);
  });
}

function openCourseModal(course) {
  currentCourseId = course.id;
  document.getElementById('modalImage').src = course.image;
  document.getElementById('modalTitle').textContent = course.title;
  document.getElementById('modalRating').textContent = course.rating + ' (' + course.students + ' reviews)';
  document.getElementById('modalStudents').textContent = course.students.toLocaleString();
  document.getElementById('modalDuration').textContent = course.duration;
  document.getElementById('modalInstructor').innerHTML = `<strong>Instructor:</strong> ${course.instructor}`;
  document.getElementById('modalCategory').innerHTML = `<strong>Category:</strong> ${course.category}`;
  document.getElementById('modalLevel').innerHTML = `<strong>Level:</strong> ${course.level}`;
  document.getElementById('modalDescription').textContent = course.description;
  document.getElementById('modalPrice').textContent = `$${course.price}`;
  courseModal.style.display = 'block';
}

function openCartModal() {
  cartModal.style.display = 'block';
  displayCartItems();
}

function displayCartItems() {
  const cartItems = document.getElementById('cartItems');
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<p style="text-align: center; padding: 2rem; color: #999;">Your cart is empty</p>';
  } else {
    cart.forEach((item, index) => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.title}</h4>
          <p>By ${item.instructor}</p>
        </div>
        <div class="cart-item-price">$${item.price}</div>
        <button class="remove-btn" onclick="removeFromCart(${index})">
          <i class="fas fa-trash"></i>
        </button>
      `;
      cartItems.appendChild(cartItem);
    });
  }

  updateCartSummary();
}

function updateCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const discount = subtotal * 0.1;
  const total = subtotal - discount;

  document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById('discount').textContent = `-$${discount.toFixed(2)}`;
  document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

function addToCart() {
  const course = allCourses.find(c => c.id === currentCourseId);
  if (course && !cart.find(c => c.id === course.id)) {
    cart.push(course);
    updateCartCount();
    courseModal.style.display = 'none';
    showNotification('Course added to cart!', `${course.title} has been added`);
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartCount();
  displayCartItems();
}

function updateCartCount() {
  cartCount.textContent = cart.length;
}

async function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart })
    });

    const data = await response.json();

    if (data.success) {
      cart = [];
      updateCartCount();
      cartModal.style.display = 'none';
      showSuccessMessage(`Order ${data.orderId}`, `Total: $${data.total}`);
    }
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Checkout failed. Please try again.');
  }
}

function showNotification(title, text) {
  const msg = successMessage;
  document.getElementById('successTitle').textContent = title;
  document.getElementById('successText').textContent = text;
  msg.style.display = 'flex';
  setTimeout(() => {
    msg.style.display = 'none';
  }, 3000);
}

function showSuccessMessage(title, text) {
  showNotification(title, text);
}

function filterCourses() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  const filtered = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm) ||
                          course.description.toLowerCase().includes(searchTerm) ||
                          course.instructor.toLowerCase().includes(searchTerm);
    const matchesCategory = !selectedCategory || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  displayCourses(filtered);
}

courseModalClose.addEventListener('click', () => courseModal.style.display = 'none');
cartModalClose.addEventListener('click', () => cartModal.style.display = 'none');
cartBtn.addEventListener('click', openCartModal);
searchBtn.addEventListener('click', filterCourses);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') filterCourses();
});
categoryFilter.addEventListener('change', filterCourses);
document.getElementById('addToCartBtn').addEventListener('click', addToCart);
checkoutBtn.addEventListener('click', checkout);
continueShoppingBtn.addEventListener('click', () => cartModal.style.display = 'none');

window.addEventListener('click', (e) => {
  if (e.target === courseModal) courseModal.style.display = 'none';
  if (e.target === cartModal) cartModal.style.display = 'none';
});

fetchCourses();
