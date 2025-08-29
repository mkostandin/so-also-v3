# Mapbox Setup Instructions

## 🚨 IMPORTANT: You need to set up your Mapbox token to fix the map errors!

### Step 1: Create .env file
Create a file named `.env` in the root directory of your project (same level as package.json).

### Step 2: Add your Mapbox token
Add this content to your `.env` file:

```env
# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_actual_token_here

# API Configuration
VITE_API_URL=http://localhost:5500
```

### Step 3: Get your Mapbox token
1. Go to [https://account.mapbox.com/access-tokens/](https://account.mapbox.com/access-tokens/)
2. Sign up or log in to Mapbox
3. Create a new token or copy an existing one
4. Replace `your_actual_token_here` with your real token

### Step 4: Restart your development server
After adding the token, restart your UI server:
```bash
cd ui && pnpm run dev
```

## 🔧 Current Issues Fixed:
- ✅ React Router nested routes warning
- ✅ PWA manifest icon paths
- ✅ Deprecated meta tags
- ✅ Asset file paths

## 🎯 What will work after adding your token:
- ✅ Interactive map with events
- ✅ Event clustering and filtering
- ✅ User location with geolocation
- ✅ Event details popups
- ✅ No more CORS errors

## 📝 Example .env file:
```env
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cl91c2VybmFtZSIsImEiOiJjbGY5dzN6cHgwMmRnM3FxbXF4YWQzN2Y1ZSJ9.8kCXJzJvqW8N5kXJQzY7Qw
VITE_API_URL=http://localhost:5500
```
