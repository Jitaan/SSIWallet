import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Services
import IssuerService from './services/IssuerService.js';
import BlockchainService from './services/BlockchainService.js';

// Routes
import issuerRoutes from './routes/issuer.js';
import verifyRoutes from './routes/verify.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Initialize services
console.log('🚀 Starting SSI Backend...\n');
await IssuerService.initialize();
console.log('');

// Routes
app.use('/api/issuer', issuerRoutes);
app.use('/api/verify', verifyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    issuer: IssuerService.getInfo(),
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SSI Backend</title>
        <style>
          body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
          h1 { color: #333; }
          .info { background: #f0f0f0; padding: 15px; border-radius: 5px; }
          a { color: #007AFF; text-decoration: none; }
        </style>
      </head>
      <body>
        <h1>🎓 SSI Backend Server</h1>
        <div class="info">
          <p><strong>Status:</strong> Running</p>
          <p><strong>Issuer DID:</strong> ${IssuerService.getIssuerDID()}</p>
        </div>
        <h2>Available Endpoints:</h2>
        <ul>
          <li><a href="/issuer-portal.html">📋 Issuer Portal</a></li>
          <li><a href="/health">/health</a></li>
          <li><a href="/api/issuer/info">/api/issuer/info</a></li>
          <li><a href="/api/issuer/stats">/api/issuer/stats</a></li>
        </ul>
      </body>
    </html>
  `);
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('✅ SSI Backend is running!');
  console.log('');
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`📋 Portal: http://localhost:${PORT}/issuer-portal.html`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log('');
  console.log(`📍 Issuer DID: ${IssuerService.getIssuerDID()}`);
  console.log('');
});

// Background task - process blockchain anchors every 5 minutes
setInterval(async () => {
  try {
    console.log('⏰ Running scheduled blockchain anchoring...');
    await BlockchainService.processBatch();
  } catch (error) {
    console.error('Error in scheduled anchoring:', error.message);
  }
}, 5 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});