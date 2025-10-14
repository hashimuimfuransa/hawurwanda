# HAWU Rwanda 2.0

A comprehensive salon/barber booking, payment, and union-management platform built with React, Node.js, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB (local or cloud)
- Git

### Installation & Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd hawurwanda
npm install
```

2. **Set up environment variables:**
```bash
# Copy example environment files
cp server/.env.example server/.env
cp client/.env.example client/.env

# Edit server/.env with your MongoDB URI and other credentials
# Edit client/.env with your API base URL
```

3. **Seed the database:**
```bash
npm run seed
```

4. **Start development servers:**
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend client on http://localhost:3000

### Individual Commands

**Backend (Server):**
```bash
cd server
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run seed         # Seed database with sample data
```

**Frontend (Client):**
```bash
cd client
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
```

## 🏗️ Project Structure

```
hawurwanda/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom React hooks
│   │   └── styles/        # Tailwind CSS
│   └── package.json
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middlewares/   # Custom middlewares
│   │   ├── utils/         # Utility functions
│   │   └── jobs/          # Background jobs
│   └── package.json
└── README.md
```

## 🔐 Seeded Accounts

After running `npm run seed`, you'll have these test accounts:

- **Super Admin:** admin@hawu.com / password123
- **Admin:** moderator@hawu.com / password123
- **Salon Owner:** owner@salon.com / password123
- **Barber:** barber@salon.com / password123
- **Client:** client@test.com / password123

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run server tests only
npm run test:server

# Run client tests only
npm run test:client
```

## 🐳 Docker Support

```bash
# Start with Docker Compose
docker-compose up -d

# This starts MongoDB and the server
# Access at http://localhost:5000
```

## 🚀 Deployment

### Server (Railway/Render)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Client (Vercel)
1. Connect your GitHub repository
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/dist`

## 📱 Features

- **Client Features:**
  - Browse and search salons
  - Book appointments with barbers
  - Pay deposits or full amounts
  - View booking history
  - Real-time notifications

- **Barber Features:**
  - Manage availability
  - View daily bookings
  - Mark services as completed
  - Record payments

- **Owner Features:**
  - Manage salon and barbers
  - View daily reports
  - Verify payments
  - Upload salon gallery

- **Admin Features:**
  - Verify salon registrations
  - View platform reports
  - Manage users

## 🔧 Environment Variables

### Server (.env)
```
MONGODB_URI=mongodb://localhost:27017/hawu-rwanda
PORT=5000
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Airtel Money API
AIRTEL_CLIENT_ID=your-client-id
AIRTEL_CLIENT_SECRET=your-client-secret
AIRTEL_BASE_URL=https://openapiuat.airtel.africa

# Twilio (for SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=HAWU Rwanda 2.0
```

## 📚 API Documentation

The API follows RESTful conventions. Key endpoints:

- `POST /api/auth/login` - User login
- `GET /api/salons` - List salons
- `POST /api/bookings` - Create booking
- `POST /api/transactions/airtel/confirm` - Confirm payment

See the Postman collection in `/docs` for complete API documentation.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
