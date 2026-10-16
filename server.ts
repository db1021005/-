import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Windows 11 Web Server Diagnostics API
app.get('/api/server-info', (req, res) => {
  res.json({
    platform: 'Windows 11 x64',
    serverEngine: 'Express 4.21 / Node.js',
    dspEngine: 'WebAudio 96kHz Low-Latency',
    status: 'ONLINE',
    uptime: process.uptime(),
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// Mock/Proxy endpoint for sync if requested
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: Date.now() });
});

// In production, serve the built Vite static assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (process.env.NODE_ENV === 'production') {
  app.listen(PORT, () => {
    console.log(`[Windows 11 Server] become a guitarist PRO running on port ${PORT}`);
  });
}

export default app;
