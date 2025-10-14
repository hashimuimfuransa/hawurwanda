# Deployment Guide

This guide covers deploying HAWU Rwanda 2.0 to various platforms.

## Prerequisites

- Node.js 18+ and npm 8+
- MongoDB database (local or cloud)
- Git repository access
- Platform-specific accounts (Railway, Render, Vercel)

## Environment Variables

### Server Environment Variables
Copy `server/env.example` to `server/.env` and configure:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/hawu-rwanda

# Server Configuration
PORT=5000
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.com

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

### Client Environment Variables
Copy `client/env.example` to `client/.env` and configure:

```bash
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=HAWU Rwanda 2.0
```

## Platform-Specific Deployment

### 1. Railway (Recommended for Server)

1. **Connect Repository**
   - Go to [Railway](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Environment**
   - Go to your project settings
   - Add all environment variables from `server/env.example`
   - Set `NODE_ENV=production`
   - Set `PORT=5000` (Railway will override this)

3. **Deploy**
   - Railway will automatically deploy on push to main branch
   - Your API will be available at `https://your-project.railway.app`

### 2. Render (Alternative for Server)

1. **Create Web Service**
   - Go to [Render](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Environment**: Node
   - **Node Version**: 18

3. **Environment Variables**
   - Add all variables from `server/env.example`
   - Set `NODE_ENV=production`

### 3. Vercel (Recommended for Client)

1. **Connect Repository**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Build**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Environment Variables**
   - Add `VITE_API_BASE_URL` pointing to your server URL
   - Add `VITE_APP_NAME=HAWU Rwanda 2.0`

### 4. MongoDB Atlas (Database)

1. **Create Cluster**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Create a new cluster
   - Choose your preferred region

2. **Configure Access**
   - Create a database user
   - Whitelist your server IP addresses
   - Get your connection string

3. **Update Environment**
   - Use your Atlas connection string as `MONGODB_URI`

## Docker Deployment

### Local Docker Setup

```bash
# Start services
docker-compose up -d

# Check logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker

1. **Build Images**
```bash
# Server
cd server
docker build -t hawu-server .

# Client
cd client
docker build -t hawu-client .
```

2. **Run with Docker Compose**
```bash
# Update docker-compose.yml with production settings
docker-compose -f docker-compose.prod.yml up -d
```

## Database Setup

### Local Development
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:7

# Seed the database
npm run seed
```

### Production
```bash
# Connect to your production MongoDB
# Run seed script (be careful with production data)
npm run seed
```

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connected and seeded
- [ ] API endpoints responding
- [ ] Frontend loading correctly
- [ ] Authentication working
- [ ] File uploads working (if using Cloudinary)
- [ ] Payment integration tested (if using Airtel)
- [ ] SMS notifications working (if using Twilio)
- [ ] Email notifications working
- [ ] SSL certificates configured
- [ ] Domain names configured
- [ ] Monitoring and logging set up

## Monitoring and Maintenance

### Health Checks
- API Health: `GET /api/health`
- Database connectivity
- External service integrations

### Logs
- Server logs: Check your hosting platform's log viewer
- Error tracking: Consider Sentry or similar service
- Performance monitoring: Use tools like New Relic or DataDog

### Backup Strategy
- Database backups (automated with MongoDB Atlas)
- Environment variable backups
- Code repository backups

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check MongoDB URI format
   - Verify network access
   - Check credentials

2. **Environment Variables Not Loading**
   - Verify file naming (.env not .env.example)
   - Check variable names match exactly
   - Restart application after changes

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Check for TypeScript errors

4. **CORS Issues**
   - Verify FRONTEND_URL matches actual domain
   - Check CORS configuration in server

### Support
- Check application logs
- Verify environment variables
- Test API endpoints with Postman
- Check database connectivity

## Security Considerations

- Use strong JWT secrets
- Enable HTTPS in production
- Configure CORS properly
- Use environment variables for secrets
- Regular security updates
- Database access restrictions
- Rate limiting enabled
- Input validation enabled
