# 🚀 Deploy Global Pulse to Render

## Quick Deployment Guide

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

### 2. Deploy on Render

#### Option A: Using render.yaml (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Configure environment variables (see below)
6. Click "Create Web Service"

#### Option B: Manual Setup
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `global-pulse`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free or Starter

### 3. Environment Variables

Set these in your Render dashboard:

#### Required
```
NEXT_PUBLIC_NEWS_API_KEY=your_newsapi_key_here
NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
```

#### Optional but Recommended
```
NEXT_PUBLIC_USE_OPENSTREETMAP=true
NODE_ENV=production
```

#### For Push Notifications
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your-email@example.com
```

### 4. Post-Deployment

#### Verify Deployment
1. Wait for build to complete (2-3 minutes)
2. Visit your Render URL
3. Test all features:
   - News loading
   - Search functionality
   - Map integration
   - Settings persistence

#### Custom Domain (Optional)
1. In Render dashboard, go to "Custom Domains"
2. Add your domain (e.g., `global-pulse.app`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 5. Troubleshooting

#### Build Issues
- Check that `NODE_ENV=production` is set
- Verify all dependencies are in package.json
- Ensure `.env.local` is not committed (use Render environment variables)

#### Runtime Issues
- Check Render logs for errors
- Verify API keys are correctly set
- Ensure image domains are in next.config.js

#### Performance Tips
- Upgrade to Starter plan for better performance
- Enable Render's CDN for static assets
- Consider using Redis for caching (production)

### 6. Production Optimizations

#### Enable Render Features
- **Auto-Deploy**: Enabled for automatic updates
- **Health Checks**: Uses `/` endpoint
- **CDN**: Automatically enabled for static assets

#### Monitor Performance
- Check Render metrics dashboard
- Monitor API usage (NewsAPI limits)
- Set up alerts for downtime

## 🎯 Your App is Live!

Once deployed, your Global Pulse app will be available at:
`https://your-app-name.onrender.com`

### Features Available in Production
- ✅ Live news feed with real-time updates
- ✅ Interactive world map
- ✅ AI-powered article analysis
- ✅ Push notifications
- ✅ PWA functionality
- ✅ Responsive design
- ✅ Dark cyberpunk UI

## 📞 Support

If you encounter issues:
1. Check Render deployment logs
2. Verify environment variables
3. Ensure NewsAPI key is valid
4. Check this guide for common solutions

Happy deploying! 🌍
