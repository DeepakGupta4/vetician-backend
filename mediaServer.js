// ─────────────────────────────────────────────────────────────
//  mediaServer.js
//
//  Ye file VPS pe alag process ke roop mein chalegi
//  node mediaServer.js
//
//  Kya karta hai:
//  1. RTMP server (port 1935) - IP camera ya OBS se stream receive karta hai
//  2. RTSP pull - IP camera se seedha RTSP stream pull karta hai (ffmpeg)
//  3. HLS convert - har stream ko .m3u8 + .ts files mein convert karta hai
//  4. HTTP server (port 8888) - HLS files serve karta hai
//  5. Stream key auth - sirf authorized cameras stream kar sakein
//
//  Flow:
//  IP Camera (RTSP) → ffmpeg → RTMP → Node-Media-Server → HLS → App
// ─────────────────────────────────────────────────────────────

require('dotenv').config();
const NodeMediaServer = require('node-media-server');
const { spawn }       = require('child_process');
const path            = require('path');
const fs              = require('fs');
const http            = require('http');
const mongoose        = require('mongoose');

// ── HLS output directory ──────────────────────────────────────
const HLS_DIR = path.join(__dirname, 'media', 'hls');
if (!fs.existsSync(HLS_DIR)) fs.mkdirSync(HLS_DIR, { recursive: true });

// ── MongoDB connect (stream key validation ke liye) ───────────
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('✅ MediaServer: MongoDB connected');
}).catch(err => console.error('❌ MongoDB error:', err));

const Camera = require('./models/Camera');

// ─────────────────────────────────────────────────────────────
//  Node Media Server Config
//  RTMP port: 1935  (camera/OBS yahan push karta hai)
//  HTTP port: 8888  (HLS files yahan se serve hoti hain)
// ─────────────────────────────────────────────────────────────
const nmsConfig = {
  rtmp: {
    port: process.env.RTMP_PORT || 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: process.env.MEDIA_HTTP_PORT || 8888,
    mediaroot: path.join(__dirname, 'media'),
    allow_origin: '*',
  },
  trans: {
    ffmpeg: process.env.FFMPEG_PATH || '/usr/bin/ffmpeg',  // VPS pe ffmpeg path
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        hlsKeepSegments: 3,
        dash: false,
      },
    ],
  },
  auth: {
    // Stream publish karne ke liye secret key chahiye
    // Camera push karega: rtmp://server/live/STREAM_KEY?sign=SECRET
    publish: false,   // Hum manually validate karenge niche
    play:    false,
  },
};

const nms = new NodeMediaServer(nmsConfig);

// ─────────────────────────────────────────────────────────────
//  Stream Events
// ─────────────────────────────────────────────────────────────

// Jab koi camera stream push kare
nms.on('prePublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/').pop();
  console.log(`📹 Stream starting: ${streamKey}`);

  // Validate stream key against DB
  const camera = await Camera.findOne({ streamKey, isActive: true });
  if (!camera) {
    console.log(`❌ Invalid stream key: ${streamKey} - rejecting`);
    const session = nms.getSession(id);
    session.reject();
    return;
  }

  // Update camera status to streaming
  await Camera.findByIdAndUpdate(camera._id, { isStreaming: true, lastStreamAt: new Date() });
  console.log(`✅ Stream authorized: ${camera.name} (${streamKey})`);
});

// Jab stream band ho
nms.on('donePublish', async (id, StreamPath, args) => {
  const streamKey = StreamPath.split('/').pop();
  await Camera.findOneAndUpdate({ streamKey }, { isStreaming: false });
  console.log(`📴 Stream ended: ${streamKey}`);
});

nms.run();
console.log(`🎥 RTMP Server running on port ${process.env.RTMP_PORT || 1935}`);
console.log(`🌐 HLS Server running on port ${process.env.MEDIA_HTTP_PORT || 8888}`);

// ─────────────────────────────────────────────────────────────
//  RTSP Pull - IP Camera se seedha stream pull karna
//
//  Jab resort owner camera add kare aur streamType = 'rtsp' ho
//  tab ye function camera ke RTSP URL se stream pull karta hai
//  aur RTMP mein push karta hai (jo HLS ban jaata hai)
//
//  Usage: startRtspPull('rtsp://192.168.1.100/stream1', 'room1_cam')
// ─────────────────────────────────────────────────────────────

const activeRtspProcesses = new Map();  // streamKey → ffmpeg process

const startRtspPull = (rtspUrl, streamKey) => {
  if (activeRtspProcesses.has(streamKey)) {
    console.log(`⚠️ Stream already running: ${streamKey}`);
    return;
  }

  const rtmpPushUrl = `rtmp://localhost:${process.env.RTMP_PORT || 1935}/live/${streamKey}`;

  console.log(`🔄 Starting RTSP pull: ${rtspUrl} → ${rtmpPushUrl}`);

  const ffmpegPath = process.env.FFMPEG_PATH || '/usr/bin/ffmpeg';

  const ffmpeg = spawn(ffmpegPath, [
    '-rtsp_transport', 'tcp',          // TCP for reliability
    '-i', rtspUrl,                      // Input: camera RTSP URL
    '-c:v', 'libx264',                  // Video codec
    '-preset', 'ultrafast',             // Fast encoding (low latency)
    '-tune', 'zerolatency',             // Zero latency tuning
    '-c:a', 'aac',                      // Audio codec
    '-ar', '44100',
    '-f', 'flv',                        // Output format for RTMP
    rtmpPushUrl,                        // Push to local RTMP server
  ]);

  ffmpeg.stderr.on('data', (data) => {
    // Uncomment for debugging:
    // console.log(`ffmpeg [${streamKey}]:`, data.toString());
  });

  ffmpeg.on('close', (code) => {
    console.log(`📴 RTSP pull ended for ${streamKey} (code: ${code})`);
    activeRtspProcesses.delete(streamKey);

    // Auto-restart after 5 seconds if camera is still active
    setTimeout(async () => {
      const camera = await Camera.findOne({ streamKey, isActive: true });
      if (camera && camera.rtspUrl) {
        console.log(`🔄 Auto-restarting RTSP pull for ${streamKey}`);
        startRtspPull(camera.rtspUrl, streamKey);
      }
    }, 5000);
  });

  ffmpeg.on('error', (err) => {
    console.error(`❌ ffmpeg error for ${streamKey}:`, err.message);
    activeRtspProcesses.delete(streamKey);
  });

  activeRtspProcesses.set(streamKey, ffmpeg);
};

const stopRtspPull = (streamKey) => {
  const process = activeRtspProcesses.get(streamKey);
  if (process) {
    process.kill('SIGTERM');
    activeRtspProcesses.delete(streamKey);
    console.log(`🛑 Stopped RTSP pull: ${streamKey}`);
  }
};

// ─────────────────────────────────────────────────────────────
//  Auto-start all active RTSP cameras on server boot
// ─────────────────────────────────────────────────────────────
const autoStartCameras = async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for DB connection
    const cameras = await Camera.find({ isActive: true, streamType: 'rtsp', rtspUrl: { $ne: null } });
    console.log(`🚀 Auto-starting ${cameras.length} RTSP cameras...`);
    cameras.forEach(cam => startRtspPull(cam.rtspUrl, cam.streamKey));
  } catch (err) {
    console.error('❌ Auto-start error:', err.message);
  }
};

autoStartCameras();

// ─────────────────────────────────────────────────────────────
//  Management API (port 8889) - Backend server yahan se cameras control karta hai
// ─────────────────────────────────────────────────────────────
const mgmtServer = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const url = new URL(req.url, `http://localhost`);

  // GET /streams - active streams list
  if (req.method === 'GET' && url.pathname === '/streams') {
    const streams = Array.from(activeRtspProcesses.keys());
    res.end(JSON.stringify({ streams }));
    return;
  }

  // POST /start - start RTSP pull for a camera
  if (req.method === 'POST' && url.pathname === '/start') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { rtspUrl, streamKey } = JSON.parse(body);
      startRtspPull(rtspUrl, streamKey);
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  // POST /stop - stop RTSP pull
  if (req.method === 'POST' && url.pathname === '/stop') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      const { streamKey } = JSON.parse(body);
      stopRtspPull(streamKey);
      res.end(JSON.stringify({ success: true }));
    });
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ error: 'Not found' }));
});

mgmtServer.listen(process.env.MEDIA_MGMT_PORT || 8889, () => {
  console.log(`🔧 Management API running on port ${process.env.MEDIA_MGMT_PORT || 8889}`);
});

module.exports = { startRtspPull, stopRtspPull };
