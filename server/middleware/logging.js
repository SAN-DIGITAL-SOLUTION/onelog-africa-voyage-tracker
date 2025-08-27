const winston = require('winston');

// Configure winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'control-room-server' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      transporteurId: req.params.transporteurId || 'unknown'
    });
  });
  
  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('HTTP Error', {
    method: req.method,
    url: req.url,
    status: res.statusCode || 500,
    error: err.message,
    stack: err.stack,
    ip: req.ip || req.connection.remoteAddress,
    transporteurId: req.params.transporteurId || 'unknown'
  });
  
  next(err);
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      logger.warn('Slow Request', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        threshold: '1000ms'
      });
    }
  });
  
  next();
};

// WebSocket logging
const socketLogger = (io) => {
  io.on('connection', (socket) => {
    logger.info('WebSocket Client Connected', {
      socketId: socket.id,
      transporteurId: socket.handshake.query.transporteurId || 'unknown'
    });

    socket.on('disconnect', () => {
      logger.info('WebSocket Client Disconnected', {
        socketId: socket.id
      });
    });

    socket.on('join_transporteur', (transporteurId) => {
      logger.info('Client joined transporteur room', {
        socketId: socket.id,
        transporteurId
      });
    });

    socket.on('leave_transporteur', (transporteurId) => {
      logger.info('Client left transporteur room', {
        socketId: socket.id,
        transporteurId
      });
    });
  });
};

// Database query logging
const dbLogger = (operation, table, duration, success = true) => {
  const level = success ? 'info' : 'error';
  logger[level]('Database Operation', {
    operation,
    table,
    duration: `${duration}ms`,
    success
  });
};

// Real-time updates logging
const realtimeLogger = (event, transporteurId, data) => {
  logger.info('Realtime Update', {
    event,
    transporteurId,
    dataCount: Array.isArray(data) ? data.length : 1,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  requestLogger,
  errorLogger,
  performanceMonitor,
  socketLogger,
  dbLogger,
  realtimeLogger
};
