# 🌍 Global Pulse - Hear the World

A fully functional real-time global news website delivering verified, up-to-the-minute stories and alerts from around the world.

![Global Pulse](https://img.shields.io/badge/Status-Live-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8)

## ✨ Features

### 🔴 Live News Feed
- **Real-time updates** from NewsAPI.org with automatic refresh every 30 seconds
- **Breaking news alerts** for stories published within the last 2 hours
- **Category filtering**: General, Technology, Business, Health, Science, Sports, Entertainment
- **Country-specific news** from 30+ countries worldwide
- **Search functionality** with real-time API queries

### 🔔 Push Notifications
- **Browser push notifications** using Web Push API and Service Workers
- **Smart notification system** that detects new breaking stories
- **Customizable notification sounds** (breaking news, local alerts, personal topics)
- **Quiet hours** feature to silence notifications during specified times

### 🎵 Notification Sounds
- **Three sound categories**: Breaking News, Local Alerts, Personal Topics
- **Multiple sound options** per category
- **Real audio playback** triggered by verified new stories
- **Volume control** and mute options

### 🗺️ Live Map Integration
- **Interactive world map** using Leaflet and OpenStreetMap
- **Real-time story markers** showing news locations
- **Animated markers** with pulse effects for breaking news
- **Clickable popups** with story details and links

### 🔍 Search & Filters
- **Real-time search** querying live API data
- **Country selector** with 30+ countries
- **Category filters** for focused news browsing
- **No mock data** - all results from real APIs

### ⚙️ User Settings
- **Persistent preferences** stored in LocalStorage
- **Notification sound customization**
- **Quiet hours scheduling**
- **Auto-refresh intervals**
- **All settings functional** and immediately applied

### 🎨 Dark Futuristic UI
- **Cyberpunk-inspired design** with red and blue accent glows
- **Smooth animations** using Framer Motion
- **Pulse effects** for live updates
- **Heartbeat animation** showing active story count
- **Responsive design** for desktop and mobile

### 📱 PWA Ready
- **Progressive Web App** with manifest.json
- **Service Worker** for offline caching
- **Installable** on mobile and desktop
- **Background sync** capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- NewsAPI.org API key (free tier available)

### Installation

1. **Clone or navigate to the project**
```bash
cd C:\Users\kickx\CascadeProjects\global-pulse
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy the example env file
copy .env.local.example .env.local

# Edit .env.local and add your API keys
```

4. **Add your NewsAPI key**
Edit `.env.local` and add:
```env
NEXT_PUBLIC_NEWS_API_KEY=your_actual_newsapi_key_here
NEXT_PUBLIC_USE_OPENSTREETMAP=true
```

Get your free API key from: https://newsapi.org/register

5. **Add notification sound files (optional)**
Place MP3 files in `public/sounds/`:
- `breaking.mp3`
- `alert.mp3`
- `notification.mp3`

See `public/sounds/README.md` for details.

6. **Run the development server**
```bash
npm run dev
```

7. **Open your browser**
Navigate to: http://localhost:3000

The website will immediately start fetching live news from the API!

## 🔧 Configuration

### Environment Variables

#### Required
- `NEXT_PUBLIC_NEWS_API_KEY` - Your NewsAPI.org API key

#### Optional
- `NEXT_PUBLIC_USE_OPENSTREETMAP=true` - Use OpenStreetMap (no token required)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` - For Mapbox maps (better features)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - For push notifications
- `VAPID_PRIVATE_KEY` - For push notifications
- `VAPID_EMAIL` - Your email for VAPID

### Generate VAPID Keys for Push Notifications

```bash
npx web-push generate-vapid-keys
```

Add the generated keys to `.env.local`.

## 📦 Build for Production

```bash
# Build the website
npm run build

# Start production server
npm start
```

The production build is optimized and ready for deployment.

## 🌐 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Netlify
1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add environment variables
4. Deploy

### Other Platforms
The website works on any platform supporting Next.js:
- AWS Amplify
- Google Cloud Run
- Azure Static Web Apps
- Railway
- Render

## 🎯 Features Verification

### ✅ All Features Are Real and Working

- ✅ **Live News API**: Fetches real data from NewsAPI.org
- ✅ **Real-time Updates**: Auto-refreshes every 30 seconds
- ✅ **Push Notifications**: Real browser notifications via Service Worker
- ✅ **Notification Sounds**: Actual audio files play on new stories
- ✅ **Live Map**: Interactive Leaflet map with real coordinates
- ✅ **Search**: Queries live API, not static data
- ✅ **Filters**: All filters query the API directly
- ✅ **Settings**: Persist in LocalStorage and work immediately
- ✅ **PWA**: Full Progressive Web App with offline support
- ✅ **Responsive**: Works perfectly on all devices

### 🚫 No Placeholders or Mock Data

This website contains **ZERO**:
- Mock API responses
- Fake data generators
- Placeholder content
- Simulated notifications
- Static news lists
- Dummy endpoints

**Everything is real and functional!**

## 📊 API Usage

### NewsAPI.org
- **Free tier**: 100 requests/day
- **Developer tier**: 1000 requests/day
- **Endpoints used**:
  - `/v2/top-headlines` - For category and country news
  - `/v2/everything` - For search queries

### Rate Limiting
The website automatically handles API rate limits and shows appropriate error messages.

## 🎨 Customization

### Colors
Edit `tailwind.config.js` to customize the cyber theme colors:
```js
colors: {
  cyber: {
    red: '#ff0040',
    blue: '#00d4ff',
    purple: '#bd00ff',
    // ... more colors
  }
}
```

### Refresh Interval
Default is 30 seconds. Users can change this in Settings, or modify the default in:
```typescript
// src/hooks/useNewsData.ts
refreshInterval: 30000 // milliseconds
```

### Sound Files
Replace MP3 files in `public/sounds/` with your own notification sounds.

## 🐛 Troubleshooting

### "Failed to fetch news"
- Check your NewsAPI key is correct in `.env.local`
- Verify you haven't exceeded API rate limits
- Check your internet connection

### Notifications not working
- Click "Enable Alerts" button
- Allow notifications in browser settings
- Check browser supports notifications (Chrome, Firefox, Edge)

### Map not loading
- Ensure `NEXT_PUBLIC_USE_OPENSTREETMAP=true` is set
- Check browser console for errors
- Verify internet connection

### Sounds not playing
- Add MP3 files to `public/sounds/` directory
- Check browser allows audio autoplay
- Verify sound files are valid MP3 format

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Edge 90+
- ✅ Safari 14+ (limited notification support)
- ✅ Mobile browsers (Chrome, Safari, Firefox)

## 🔒 Security

- API keys stored in environment variables
- No sensitive data in client code
- HTTPS required for push notifications
- Content Security Policy headers configured
- XSS protection enabled

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Review NewsAPI documentation
- Open an issue on GitHub

## 🎉 Credits

- **News Data**: [NewsAPI.org](https://newsapi.org)
- **Maps**: [Leaflet](https://leafletjs.com) + [OpenStreetMap](https://www.openstreetmap.org)
- **Icons**: [Lucide React](https://lucide.dev)
- **Framework**: [Next.js](https://nextjs.org)
- **Styling**: [TailwindCSS](https://tailwindcss.com)
- **Animations**: [Framer Motion](https://www.framer.com/motion)

---

**Global Pulse** - Hear the world. 🌍

Built with ❤️ using real APIs and zero placeholders.
