# MarketHub - Online Marketplace

A full-stack online marketplace platform with buyer and seller functionality.

## Features

- **Product Listing**: Browse all available products with ratings and reviews
- **Shopping Cart**: Add/remove products, update quantities
- **User Authentication**: Separate login for buyers and sellers
- **Buyer Dashboard**: View orders, track spending, manage cart
- **Seller Dashboard**: Add new products, manage inventory
- **Search & Filter**: Find products by name, category, or price range
- **Order Management**: Place and track orders
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Storage**: In-memory (can be replaced with database)

## Installation

1. Navigate to the project directory
2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

1. Start the server:
   ```
   npm start
   ```

2. Open your browser and visit:
   ```
   http://localhost:3000
   ```

## Demo Credentials

### Buyer Account
- Email: buyer@example.com
- Password: pass123

### Seller Account
- Email: seller@example.com
- Password: pass123

## Features Walkthrough

### For Buyers
1. Login as a buyer
2. Browse products on the homepage
3. Use search and filters to find products
4. Add products to cart
5. Proceed to checkout
6. View order history in dashboard

### For Sellers
1. Login as a seller
2. Access Seller Dashboard
3. Add new products with name, price, category, and image
4. View all your listed products
5. Manage inventory

## Project Structure

```
├── server.js           # Express server with API endpoints
├── package.json        # Dependencies
└── public/
    ├── index.html      # Main HTML
    ├── style.css       # Styling
    └── script.js       # Frontend logic
```

## API Endpoints

- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user
- `GET /api/products` - Get all products with filters
- `GET /api/product/:id` - Get product details
- `POST /api/cart/add` - Add to cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/remove` - Remove from cart
- `POST /api/cart/update` - Update quantity
- `POST /api/checkout` - Checkout
- `GET /api/orders` - Get user orders
- `POST /api/product/add` - Add new product (seller)
- `GET /api/seller-products` - Get seller's products

## Future Enhancements

- Database integration (MongoDB/MySQL)
- User registration
- Payment gateway integration
- Admin panel
- Product reviews and ratings
- Email notifications
- Wishlist feature
- Real-time notifications
