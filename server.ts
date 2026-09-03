import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectDB, getDBStatus } from './server/config/db';
import { initSocketIO } from './server/socket';
import { db } from './server/db/store';
import { providerManager } from './server/providers';
import { searchLocations } from './server/services/locationService';

// Routers
import authRoutes from './server/routes/authRoutes';
import patientRoutes from './server/routes/patientRoutes';
import facilityRoutes from './server/routes/facilityRoutes';
import doctorRoutes from './server/routes/doctorRoutes';
import appointmentRoutes from './server/routes/appointmentRoutes';
import emergencyRoutes from './server/routes/emergencyRoutes';
import medicalRoutes from './server/routes/medicalRoutes';
import aiRoutes from './server/routes/aiRoutes';
import notificationRoutes from './server/routes/notificationRoutes';

// Direct controller handlers for backward compatibility
import { handleHealthChatbot, queryAiNavigator, queryAiAssistant } from './server/controllers/aiController';
import { optionalAuth } from './server/middleware/auth';

dotenv.config();

const app = express();
const PORT = 3000;
const httpServer = http.createServer(app);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Socket.IO
const io = initSocketIO(httpServer);

// Connect to MongoDB
connectDB().catch((err) => {
  console.log(`Database initialization notice: ${err.message}`);
});

// ====================================================
// API ROUTE MOUNTING
// ====================================================

// System Health Check
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.json({
    status: 'ok',
    app: 'GramAarogya - SwasthyaSetu Maharashtra Complete Node.js Backend',
    timestamp: new Date().toISOString(),
    database: {
      type: 'MongoDB (Mongoose)',
      connected: dbStatus.isConnected,
      dbName: dbStatus.dbName,
    },
    realtime: {
      socketIO: true,
    },
    aiConfigured: !!process.env.GEMINI_API_KEY,
    dataMode: db.isLiveMode ? 'LIVE_PRODUCTION' : 'DEMO_SANDBOX',
    activeProvider: providerManager.getActiveProvider().name,
  });
});

// Data Provider & Environment Management
app.get('/api/data-mode', (req, res) => {
  res.json({
    isLiveMode: db.isLiveMode,
    modeLabel: db.isLiveMode ? 'LIVE / VERIFIED PRODUCTION' : 'DEMO SANDBOX',
    providers: providerManager.getProviderStatus(),
    activeProvider: providerManager.getActiveProvider().name,
  });
});

app.post('/api/data-mode', (req, res) => {
  const { isLiveMode, providerType } = req.body;
  if (typeof isLiveMode === 'boolean') {
    db.isLiveMode = isLiveMode;
    db.logAction(
      'SWITCH_DATA_MODE',
      'System Configuration',
      '/api/data-mode',
      'SUCCESS',
      `Switched system data mode to ${isLiveMode ? 'LIVE_PRODUCTION' : 'DEMO_SANDBOX'}`
    );
  }
  if (providerType) {
    providerManager.setProviderType(providerType);
  }
  res.json({
    success: true,
    isLiveMode: db.isLiveMode,
    providers: providerManager.getProviderStatus(),
    activeProvider: providerManager.getActiveProvider().name,
  });
});

// Location Geocoding
app.get('/api/location/search', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const results = await searchLocations(q);
    res.json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Direct Endpoints with optional authentication
app.post('/api/chat', optionalAuth, handleHealthChatbot);
app.post('/api/health-assistant', optionalAuth, handleHealthChatbot);
app.post('/api/ai-navigator', optionalAuth, queryAiNavigator);
app.post('/api/ai-assistant', optionalAuth, queryAiAssistant);

// Core Modular Routers
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Direct Aliases for frontend backward compatibility
app.use('/api', medicalRoutes);

// ====================================================
// FRONTEND SERVING & VITE INTEGRATION
// ====================================================

async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const isProd = process.env.NODE_ENV === 'production' || fs.existsSync(path.join(distPath, 'index.html'));

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 GramAarogya Node.js Backend & Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
