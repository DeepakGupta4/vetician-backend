# 🎥 Vetician Pet Watching - Production Camera Setup Guide

## Tujhe kya chahiye

| Cheez | Kahan se | Cost |
|-------|----------|------|
| VPS Server | DigitalOcean / AWS EC2 / Hostinger VPS | ~₹500/month |
| IP Camera | Amazon - TP-Link Tapo C200 | ~₹1500 |
| Domain (optional) | GoDaddy / Namecheap | ~₹800/year |

---

## Step 1 - VPS Kharido aur Setup Karo

### DigitalOcean pe (Recommended)
1. digitalocean.com pe jaao
2. "Create Droplet" → Ubuntu 22.04 → Basic → $6/month
3. SSH key add karo
4. Droplet create karo → IP note karo (e.g. `143.110.x.x`)

### VPS pe SSH karo
```bash
ssh root@YOUR_VPS_IP
```

---

## Step 2 - VPS pe Software Install Karo

```bash
# System update
apt update && apt upgrade -y

# Node.js 18 install
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# ffmpeg install (RTSP → HLS conversion ke liye ZARURI hai)
apt install -y ffmpeg

# ffmpeg verify karo
ffmpeg -version

# PM2 install (process manager - server band hone pe auto-restart)
npm install -g pm2

# Git install
apt install -y git
```

---

## Step 3 - Backend Code VPS pe Deploy Karo

```bash
# Apna backend clone karo
git clone YOUR_REPO_URL /var/www/vetician-backend
cd /var/www/vetician-backend

# Dependencies install karo
npm install

# .env file banao
nano .env
```

### .env mein ye values set karo:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3000

# Media Server - apna VPS IP daalo
MEDIA_SERVER_HOST=143.110.x.x
MEDIA_BASE_URL=http://143.110.x.x:8888
MEDIA_MGMT_URL=http://localhost:8889
RTMP_PORT=1935
MEDIA_HTTP_PORT=8888
FFMPEG_PATH=/usr/bin/ffmpeg
```

---

## Step 4 - Firewall Ports Open Karo

```bash
# UFW firewall setup
ufw allow 22      # SSH
ufw allow 3000    # Backend API
ufw allow 1935    # RTMP (camera stream receive)
ufw allow 8888    # HLS stream serve (app yahan se dekhegi)
ufw allow 8889    # Management API (internal)
ufw enable
```

---

## Step 5 - Dono Servers Start Karo PM2 se

```bash
cd /var/www/vetician-backend

# Main backend server start karo
pm2 start server.js --name "vetician-api"

# Media server start karo (alag process)
pm2 start mediaServer.js --name "vetician-media"

# Auto-start on reboot
pm2 startup
pm2 save

# Status check karo
pm2 status
pm2 logs vetician-media
```

---

## Step 6 - IP Camera Setup Karo (TP-Link Tapo C200)

### Camera ko WiFi se connect karo:
1. Tapo app download karo (phone pe)
2. Camera add karo → WiFi se connect karo
3. Camera ka IP note karo (router admin panel se) e.g. `192.168.1.100`

### Camera ka RTSP URL format:
```
rtsp://USERNAME:PASSWORD@CAMERA_IP:554/stream1
```

**TP-Link Tapo ke liye:**
```
rtsp://admin:YOUR_PASSWORD@192.168.1.100:554/stream1
```

**Hikvision ke liye:**
```
rtsp://admin:YOUR_PASSWORD@192.168.1.100:554/Streaming/Channels/101
```

**Dahua ke liye:**
```
rtsp://admin:YOUR_PASSWORD@192.168.1.100:554/cam/realmonitor?channel=1&subtype=0
```

### RTSP test karo (VPS pe):
```bash
ffplay rtsp://admin:password@CAMERA_IP:554/stream1
# Ya
ffprobe rtsp://admin:password@CAMERA_IP:554/stream1
```

---

## Step 7 - Resort Owner App se Camera Add Karo

1. Provider app open karo
2. Camera Management screen pe jaao
3. "Add New Camera" tap karo
4. Fill karo:
   - **Camera Name**: "Room 1 Camera"
   - **Room**: "Room 1"
   - **Stream Type**: RTSP
   - **RTSP URL**: `rtsp://admin:password@192.168.1.100:554/stream1`
5. Save karo

**Backend automatically:**
- Unique stream key generate karega (e.g. `a3f9b2c1d4e5`)
- HLS URL set karega: `http://143.110.x.x:8888/live/a3f9b2c1d4e5/index.m3u8`
- Media server ko RTSP pull start karne ka signal dega

---

## Step 8 - Test Karo

### HLS stream browser mein test karo:
```
https://hls-js.netlify.app/demo/
```
Wahan apna HLS URL paste karo:
```
http://YOUR_VPS_IP:8888/live/YOUR_STREAM_KEY/index.m3u8
```

### App mein test karo:
1. Consumer app → Pet Watching
2. Agar booking active hai aur camera assigned hai → Live stream dikhegi

---

## Step 9 - Domain + HTTPS Setup (Production Must)

```bash
# Nginx install karo
apt install -y nginx certbot python3-certbot-nginx

# Nginx config banao
nano /etc/nginx/sites-available/vetician-media
```

```nginx
server {
    listen 80;
    server_name media.vetician.com;

    location /live {
        proxy_pass http://localhost:8888/live;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control no-cache;
    }
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/vetician-media /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# SSL certificate (free)
certbot --nginx -d media.vetician.com
```

### .env update karo:
```env
MEDIA_BASE_URL=https://media.vetician.com
```

---

## Poora Flow Summary

```
IP Camera (Resort pe)
    ↓ RTSP: rtsp://admin:pass@192.168.1.100/stream1
    
VPS pe Node Media Server (mediaServer.js)
    ↓ ffmpeg RTSP → RTMP → HLS convert
    
HLS Files: /var/www/vetician-backend/media/hls/STREAM_KEY/
    ↓ serve at
    
https://media.vetician.com/live/STREAM_KEY/index.m3u8
    ↓ stored in MongoDB Camera.hlsUrl
    
Consumer App → GET /api/cameras/bookings/active
    ↓ booking.assignedCameraId.hlsUrl
    
LiveCameraCard → WebView → HLS.js → Live Video ✅
```

---

## Troubleshooting

### Stream nahi aa rahi?
```bash
# Media server logs dekho
pm2 logs vetician-media

# ffmpeg manually test karo
ffmpeg -rtsp_transport tcp -i "rtsp://admin:pass@CAMERA_IP/stream1" \
  -c:v libx264 -preset ultrafast -f flv rtmp://localhost:1935/live/test
```

### Camera RTSP nahi de raha?
- Camera ke settings mein RTSP enable karo
- Port 554 open hai ya nahi check karo
- Username/password sahi hai ya nahi

### App mein video nahi chal rahi?
- VPS port 8888 open hai ya nahi: `ufw status`
- HLS URL browser mein test karo pehle
- `react-native-webview` installed hai ya nahi check karo
