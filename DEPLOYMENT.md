# ALS Dashboard Deployment Guide

## Overview
This is a Next.js application that requires Node.js hosting. It cannot be deployed directly to a PHP server without significant modifications.

## Deployment Options

### Option 1: Vercel (Recommended)
**Best for:** Easy deployment, automatic scaling, zero configuration

1. **Push code to GitHub**
2. **Go to [vercel.com](https://vercel.com)**
3. **Import your repository**
4. **Set environment variables**
5. **Deploy automatically**

### Option 2: Railway
**Best for:** Full-stack apps with database

1. **Go to [railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Add MongoDB service**
4. **Set environment variables**
5. **Deploy**

### Option 3: Render
**Best for:** Free tier, easy setup

1. **Go to [render.com](https://render.com)**
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Set build command:** `npm run build`
5. **Set start command:** `npm start`

### Option 4: DigitalOcean App Platform
**Best for:** Production apps with scaling

1. **Go to DigitalOcean App Platform**
2. **Create new app from GitHub**
3. **Configure environment variables**
4. **Add MongoDB database**
5. **Deploy**

## Environment Variables for Production

Create a `.env.production` file with:

```env
# Database - Use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/als_dashboard

# JWT Secret - Use strong secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# App Configuration
NEXT_PUBLIC_API_URL=https://your-domain.com/api
NODE_ENV=production

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Setup

### MongoDB Atlas (Recommended)
1. **Create account at [mongodb.com](https://mongodb.com)**
2. **Create new cluster**
3. **Get connection string**
4. **Update MONGODB_URI in environment variables**

### Local MongoDB (Development only)
```bash
# Install MongoDB locally
# Update MONGODB_URI to: mongodb://localhost:27017/als_dashboard
```

## Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server
npm start

# Initialize database (first time only)
npm run init-db
```

## If You Must Use PHP Server

### Option A: Static Export (Limited)
1. **Uncomment in next.config.js:**
   ```js
   output: 'export',
   trailingSlash: true,
   distDir: 'out',
   ```
2. **Build static files:**
   ```bash
   npm run build
   ```
3. **Upload `out/` folder to PHP server**
4. **Note:** This removes API functionality

### Option B: Hybrid Deployment
1. **Frontend:** Deploy static files to PHP server
2. **Backend:** Deploy API to Node.js service (Railway/Render)
3. **Database:** Use MongoDB Atlas
4. **Update API URLs** in frontend

### Option C: Convert to PHP
**Major undertaking requiring complete rewrite**

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Use HTTPS in production
- [ ] Set up proper CORS headers
- [ ] Configure rate limiting
- [ ] Use environment variables for secrets
- [ ] Set up proper MongoDB authentication
- [ ] Configure Cloudinary security settings

## Performance Optimization

- [ ] Enable Next.js compression
- [ ] Use CDN for static assets
- [ ] Optimize images with Cloudinary
- [ ] Set up caching headers
- [ ] Monitor database performance

## Monitoring

- [ ] Set up error logging
- [ ] Monitor API response times
- [ ] Track user activity
- [ ] Set up uptime monitoring
- [ ] Configure backup strategy

## Troubleshooting

### Common Issues:
1. **Build fails:** Check Node.js version (use 18+)
2. **Database connection:** Verify MongoDB URI
3. **Environment variables:** Ensure all required vars are set
4. **CORS errors:** Check API URL configuration
5. **Authentication fails:** Verify JWT_SECRET

### Support:
- Check Next.js documentation
- Review deployment platform docs
- Check MongoDB Atlas documentation 