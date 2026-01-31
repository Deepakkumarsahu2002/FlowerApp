# Database Setup Guide

## Quick Start

1. **Install MongoDB** (if not already installed)
   - Download from: https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Create `.env` file** in `Backend` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/flowersforever
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_this
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ADMIN_EMAIL=admin@flowersforever.com
   ADMIN_PASSWORD=admin123
   ADMIN_NAME=Admin User
   ```

3. **Start MongoDB** (if using local installation)

4. **Seed the database**:
   ```bash
   cd Backend
   npm run seed
   ```

5. **Start the server**:
   ```bash
   npm run dev
   ```

## What Gets Seeded

### Categories (10 categories)
- Bouquets
- Plants
- Arrangements
- Baskets
- Dried Flowers
- Jumbo Bouquet
- Small Bouquet
- Mini Bouquets
- Custom Bouquet
- Flower Pots

### Occasions (12 occasions)
- Birthday
- Anniversary
- Valentine's Day
- Get Well
- Thank You
- Corporate
- Housewarming
- Sympathy
- Funeral
- Congratulations
- Home Decor
- Sorry

### Admin User
- Email: `admin@flowersforever.com` (or from ADMIN_EMAIL env var)
- Password: `admin123` (or from ADMIN_PASSWORD env var)
- Role: `admin`
- Profile: Created with name from ADMIN_NAME env var

## Database Collections

After seeding, you'll have:
- `categories` - Product categories
- `occasions` - Product occasions
- `users` - User accounts
- `userroles` - User roles (admin/user)
- `profiles` - User profiles
- `products` - Products (empty initially)
- `orders` - Orders (empty initially)
- `orderitems` - Order items (empty initially)
- `addresses` - User addresses (empty initially)

## Verifying Setup

1. **Check MongoDB connection**:
   - Server should log: `MongoDB Connected`

2. **Check seed script output**:
   - Should see: `✓ Created category: ...` for each category
   - Should see: `✓ Created occasion: ...` for each occasion
   - Should see: `✓ Created admin user: ...`

3. **Test admin login**:
   - Use the admin credentials to login via admin panel
   - Should successfully authenticate

4. **Test API**:
   - `GET http://localhost:5000/api/products` - Should return empty array `[]`
   - `GET http://localhost:5000/api/auth/me` - Should return user (with auth token)

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check service status
- Check MONGO_URI in `.env` file
- Try: `mongodb://127.0.0.1:27017/flowersforever`

### Seed Script Errors
- Ensure MongoDB is running before running seed
- Check `.env` file exists and has correct values
- Ensure all dependencies are installed: `npm install`

### Admin Login Not Working
- Verify seed script ran successfully
- Check UserRole collection has admin role for the user
- Check Profile collection has profile for the user
- Try running seed script again (it's idempotent - won't create duplicates)

## Production Notes

- Change `JWT_SECRET` to a strong random string
- Change admin password to something secure
- Use MongoDB Atlas or secure MongoDB instance
- Enable MongoDB authentication
- Use environment-specific `.env` files
