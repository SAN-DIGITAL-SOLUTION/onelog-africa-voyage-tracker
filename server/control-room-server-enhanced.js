const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { logger, requestLogger, errorLogger, performanceMonitor, socketLogger, dbLogger, realtimeLogger } = require('./middleware/logging');
require('dotenv').config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Apply logging middleware
app.use(requestLogger);
app.use(performanceMonitor);

// Configuration Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const { count } = await supabase
      .from('positions')
      .select('*', { count: 'exact', head: true });

    res.json({
      totalPositions: count || 0,
      activeConnections: io.engine.clientsCount,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    logger.error('Error fetching metrics', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Routes REST
app.get('/api/positions/:transporteurId', async (req, res) => {
  const start = Date.now();
  const { transporteurId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('positions')
      .select('*')
      .eq('transporteur_id', transporteurId)
      .order('timestamp', { ascending: false });

    dbLogger('SELECT', 'positions', Date.now() - start, !error);

    if (error) {
      logger.error('Error fetching positions', { transporteurId, error: error.message });
      return res.status(500).json({ error: error.message });
    }

    realtimeLogger('positions_fetched', transporteurId, data);
    res.json(data);
  } catch (error) {
    logger.error('Unexpected error fetching positions', { transporteurId, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/positions/:transporteurId/latest', async (req, res) => {
  const start = Date.now();
  const { transporteurId } = req.params;

  try {
    const { data, error } = await supabase
      .rpc('get_latest_positions', { transporteur_uuid: transporteurId });

    dbLogger('RPC', 'get_latest_positions', Date.now() - start, !error);

    if (error) {
      logger.error('Error fetching latest positions', { transporteurId, error: error.message });
      return res.status(500).json({ error: error.message });
    }

    realtimeLogger('latest_positions_fetched', transporteurId, data);
    res.json(data);
  } catch (error) {
    logger.error('Unexpected error fetching latest positions', { transporteurId, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/positions', async (req, res) => {
  const start = Date.now();
  const position = req.body;

  // Validate required fields
  const requiredFields = ['vehicule_id', 'mission_id', 'transporteur_id', 'statut', 'latitude', 'longitude'];
  const missingFields = requiredFields.filter(field => !position[field]);
  
  if (missingFields.length > 0) {
    return res.status(400).json({ 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    });
  }

  try {
    const { data, error } = await supabase
      .from('positions')
      .insert([position])
      .select()
      .single();

    dbLogger('INSERT', 'positions', Date.now() - start, !error);

    if (error) {
      logger.error('Error inserting position', { position, error: error.message });
      return res.status(500).json({ error: error.message });
    }

    // Emit to WebSocket clients
    const transporteurId = data.transporteur_id;
    io.to(`transporteur_${transporteurId}`).emit('position_update', data);
    realtimeLogger('position_created', transporteurId, data);

    res.json(data);
  } catch (error) {
    logger.error('Unexpected error inserting position', { position, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Batch operations
app.post('/api/positions/batch', async (req, res) => {
  const start = Date.now();
  const positions = req.body.positions;

  if (!Array.isArray(positions) || positions.length === 0) {
    return res.status(400).json({ error: 'Positions array is required' });
  }

  try {
    const { data, error } = await supabase
      .from('positions')
      .insert(positions)
      .select();

    dbLogger('BATCH_INSERT', 'positions', Date.now() - start, !error);

    if (error) {
      logger.error('Error batch inserting positions', { count: positions.length, error: error.message });
      return res.status(500).json({ error: error.message });
    }

    // Emit updates for each transporteur
    const transporteurs = [...new Set(data.map(p => p.transporteur_id))];
    transporteurs.forEach(transporteurId => {
      const positionsForTransporteur = data.filter(p => p.transporteur_id === transporteurId);
      io.to(`transporteur_${transporteurId}`).emit('positions_batch_update', positionsForTransporteur);
    });

    realtimeLogger('positions_batch_created', 'multiple', data);
    res.json(data);
  } catch (error) {
    logger.error('Unexpected error batch inserting positions', { count: positions.length, error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// WebSocket setup
socketLogger(io);

io.on('connection', (socket) => {
  logger.info('Client connected', { socketId: socket.id });

  socket.on('join_transporteur', (transporteurId) => {
    socket.join(`transporteur_${transporteurId}`);
    logger.info('Client joined transporteur room', { socketId: socket.id, transporteurId });
  });

  socket.on('leave_transporteur', (transporteurId) => {
    socket.leave(`transporteur_${transporteurId}`);
    logger.info('Client left transporteur room', { socketId: socket.id, transporteurId });
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected', { socketId: socket.id });
  });
});

// Supabase Realtime setup
const channel = supabase
  .channel('positions_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'positions' },
    (payload) => {
      logger.info('Database change detected', { 
        event: payload.eventType, 
        table: 'positions',
        recordId: payload.new?.id || payload.old?.id
      });

      const transporteurId = payload.new?.transporteur_id || payload.old?.transporteur_id;
      if (transporteurId) {
        io.to(`transporteur_${transporteurId}`).emit('position_update', payload.new);
        realtimeLogger('position_updated', transporteurId, payload.new);
      }
    }
  )
  .subscribe();

// Error handling middleware
app.use(errorLogger);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Control Room server started on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server };
