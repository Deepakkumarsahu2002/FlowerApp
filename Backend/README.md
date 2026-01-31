# FlowersForever Backend API

## Setup Instructions

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `Backend` directory:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/flowersforever

# Server Port
PORT=5000

# JWT Secret (Change this to a random string in production)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Admin User (for seeding)
ADMIN_EMAIL=admin@flowersforever.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
```

### 3. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# Windows (if installed as service, it should auto-start)
# Or start manually:
mongod

# macOS (using Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 4. Seed Database
Run the seed script to populate categories, occasions, and create admin user:
```bash
npm run seed
```

This will:
- Create all categories (Bouquets, Plants, Arrangements, etc.)
- Create all occasions (Birthday, Anniversary, Valentine's Day, etc.)
- Create an admin user with credentials:
  - Email: `admin@flowersforever.com`
  - Password: `admin123`

### 5. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Auth
- `POST /api/auth/signup` - User signup
- `POST /api/auth/login` - User/Admin login
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders/my` - Get user's orders (protected)
- `GET /api/orders` - Get all orders (Admin only)
- `PATCH /api/orders/:id/status` - Update order status (Admin only)

### Payment
- `POST /api/payment/razorpay/create` - Create Razorpay order (protected)
- `POST /api/payment/razorpay/verify` - Verify payment (protected)

## Database Models

### Categories
- `name` (String, required)

### Occasions
- `name` (String, required)

### Products
- `name` (String)
- `price` (Number)
- `image` (String)
- `description` (String)
- `in_stock` (Boolean, default: true)
- `category_id` (ObjectId, ref: Category)
- `occasions` (Array of ObjectId, ref: Occasion)

### Users
- `email` (String, required, unique)
- `password` (String, required, hashed)

### UserRole
- `user_id` (ObjectId, ref: User)
- `role` (String, required) - 'user' or 'admin'

### Profile
- `user_id` (ObjectId, ref: User)
- `name` (String)
- `phone` (String)
- `last_login` (Date)

### Orders
- `order_number` (String, unique)
- `user_id` (ObjectId, ref: User)
- `shipping_address_id` (ObjectId, ref: Address)
- `payment_method` (String)
- `payment_status` (String) - 'pending', 'paid', 'failed'
- `order_status` (String) - 'created', 'confirmed', 'shipped', 'delivered', 'cancelled'
- `subtotal` (Number)
- `shipping_cost` (Number)
- `total_amount` (Number)
- `razorpay_order_id` (String)
- `razorpay_payment_id` (String)
- `items` (Array of ObjectId, ref: OrderItem)

## Notes

- All timestamps are automatically managed by Mongoose
- Admin routes require both authentication and admin role
- JWT tokens expire after 7 days
- Order numbers are generated as "FF" + timestamp
