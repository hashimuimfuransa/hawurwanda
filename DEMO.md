# HAWU Rwanda 2.0 Demo Script

This script demonstrates the key features of the HAWU Rwanda 2.0 platform.

## Prerequisites

1. **Database Setup**
   ```bash
   # Start MongoDB (if using Docker)
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # Or use MongoDB Atlas
   # Update MONGODB_URI in server/.env
   ```

2. **Environment Setup**
   ```bash
   # Copy environment files
   cp server/env.example server/.env
   cp client/env.example client/.env
   
   # Edit server/.env with your MongoDB URI
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Seed Database**
   ```bash
   npm run seed
   ```

5. **Start Development Servers**
   ```bash
   npm run dev
   ```

## Demo Flow

### 1. Platform Overview (5 minutes)

**Access the Application**
- Open http://localhost:3000
- Show the landing page with hero section
- Demonstrate search functionality
- Browse featured salons

**Key Points to Highlight:**
- Modern, responsive design
- Mobile-first approach
- Search and filter capabilities
- Professional UI/UX

### 2. User Registration & Authentication (5 minutes)

**Register as Different User Types**
- Go to http://localhost:3000/register
- Register as a Client
- Register as a Salon Owner
- Register as a Barber

**Login with Seeded Accounts**
- Super Admin: admin@hawu.com / password123
- Salon Owner: owner@salon.com / password123
- Barber: barber@salon.com / password123
- Client: client@test.com / password123

**Key Points to Highlight:**
- Role-based access control
- Secure authentication with JWT
- Form validation
- User profile management

### 3. Salon Management (10 minutes)

**As Salon Owner:**
1. Login as owner@salon.com
2. Navigate to Owner Dashboard
3. Show salon management features:
   - Salon profile editing
   - Service management
   - Barber management
   - Working hours configuration
   - Gallery management

**Key Points to Highlight:**
- Complete salon management
- Service and pricing management
- Barber scheduling
- Professional dashboard

### 4. Barber Operations (10 minutes)

**As Barber:**
1. Login as barber@salon.com
2. Navigate to Barber Dashboard
3. Demonstrate:
   - Daily booking view
   - Availability management
   - Service completion
   - Payment recording

**Key Points to Highlight:**
- Real-time booking updates
- Availability management
- Service completion workflow
- Payment tracking

### 5. Client Booking Experience (15 minutes)

**As Client:**
1. Login as client@test.com
2. Browse available salons
3. Select a salon and view details
4. Book an appointment:
   - Choose barber
   - Select service
   - Pick time slot
   - Choose payment option (Full/Deposit/Cash)
5. Complete booking process

**Key Points to Highlight:**
- Intuitive booking flow
- Real-time availability
- Multiple payment options
- Booking confirmation

### 6. Payment Processing (10 minutes)

**Deposit Payment Flow:**
1. Create booking with deposit option
2. Show payment instructions
3. Demonstrate manual payment confirmation
4. Show balance remaining

**Full Payment Flow:**
1. Create booking with full payment
2. Show payment confirmation
3. Demonstrate service completion

**Key Points to Highlight:**
- Flexible payment options
- Secure payment processing
- Payment tracking
- Balance management

### 7. Admin Panel (10 minutes)

**As Super Admin:**
1. Login as admin@hawu.com
2. Navigate to Admin Panel
3. Demonstrate:
   - Salon verification process
   - Platform reports
   - User management
   - System monitoring

**Key Points to Highlight:**
- Comprehensive admin controls
- Salon verification workflow
- Platform analytics
- User management

### 8. Real-time Features (5 minutes)

**WebSocket Integration:**
1. Open multiple browser tabs
2. Create booking in one tab
3. Show real-time updates in other tabs
4. Demonstrate notification system

**Key Points to Highlight:**
- Real-time updates
- WebSocket integration
- Notification system
- Live booking updates

## API Testing with Postman

### Import Collection
1. Open Postman
2. Import `docs/postman-collection.json`
3. Set baseUrl variable to `http://localhost:5000/api`

### Test Key Endpoints
1. **Authentication**
   - POST /auth/register
   - POST /auth/login
   - GET /auth/me

2. **Salons**
   - GET /salons
   - GET /salons/:id
   - POST /salons

3. **Bookings**
   - POST /bookings
   - GET /bookings

4. **Transactions**
   - POST /transactions/airtel/confirm
   - POST /transactions/manual

5. **Admin**
   - GET /admin/salons/pending
   - PATCH /admin/salons/:id/verify
   - GET /admin/reports

## Technical Highlights

### Backend Features
- **TypeScript** for type safety
- **MongoDB** with Mongoose ODM
- **JWT** authentication
- **Role-based access control**
- **Input validation** with Joi
- **Rate limiting** for security
- **WebSocket** for real-time updates
- **File upload** with Cloudinary
- **Payment integration** with Airtel Money
- **SMS/Email** notifications

### Frontend Features
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for data fetching
- **React Hook Form** for forms
- **Responsive design**

### DevOps Features
- **Docker** containerization
- **Docker Compose** for local development
- **GitHub Actions** for CI/CD
- **Environment-based configuration**
- **Health checks**
- **Error handling**
- **Logging**

## Business Value Demonstration

### For Clients
- Easy salon discovery
- Convenient booking process
- Multiple payment options
- Real-time updates
- Professional service

### For Salons
- Complete management system
- Real-time booking updates
- Payment tracking
- Professional dashboard
- Customer management

### For Barbers
- Daily schedule management
- Service completion tracking
- Payment recording
- Availability management

### For Platform
- Scalable architecture
- Secure payment processing
- Real-time notifications
- Comprehensive analytics
- Multi-role support

## Troubleshooting

### Common Issues
1. **Database Connection**
   - Check MongoDB is running
   - Verify MONGODB_URI in .env

2. **Authentication Issues**
   - Check JWT_SECRET is set
   - Verify token expiration

3. **CORS Issues**
   - Check FRONTEND_URL in server .env
   - Verify client .env configuration

4. **Build Issues**
   - Check Node.js version (18+)
   - Clear node_modules and reinstall

### Support
- Check application logs
- Verify environment variables
- Test API endpoints
- Check database connectivity

## Next Steps

### Immediate
- Deploy to staging environment
- Set up production database
- Configure external services (Cloudinary, Airtel, Twilio)

### Future Enhancements
- Mobile app development
- Advanced analytics
- Multi-language support
- Advanced payment options
- Loyalty programs
- Review and rating system
