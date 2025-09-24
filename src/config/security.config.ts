// Configuration de sécurité pour la production OneLog Africa
// Aligné sur les standards de sécurité et compliance GDPR

export const SECURITY_CONFIG = {
  // Rate limiting configuration
  rateLimiting: {
    // API endpoints rate limits (requests per minute)
    api: {
      default: 100,
      auth: 10,
      upload: 20,
      export: 5,
      sensitive: 30
    },
    // WebSocket connections
    websocket: {
      connectionsPerIP: 5,
      messagesPerMinute: 200
    }
  },

  // CORS configuration
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://onelog-africa.com', 'https://app.onelog-africa.com']
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Nécessaire pour React
        "https://api.mapbox.com",
        "https://cdn.jsdelivr.net"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://api.mapbox.com",
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://api.mapbox.com",
        "https://*.tiles.mapbox.com"
      ],
      connectSrc: [
        "'self'",
        "https://api.mapbox.com",
        "https://events.mapbox.com",
        process.env.VITE_SUPABASE_URL || '',
        "wss://*.supabase.co"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },

  // Headers de sécurité
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(self), microphone=(), camera=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  },

  // Configuration SSL/TLS
  ssl: {
    minVersion: 'TLSv1.2',
    ciphers: [
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES128-SHA256',
      'ECDHE-RSA-AES256-SHA384'
    ].join(':'),
    honorCipherOrder: true
  },

  // Validation des entrées
  validation: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/json'
    ],
    maxRequestSize: 50 * 1024 * 1024, // 50MB
    sanitizeHtml: true,
    validateEmails: true
  },

  // Configuration des sessions
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict' as const,
    name: 'onelog_session'
  },

  // Monitoring et alertes
  monitoring: {
    enableSecurityLogs: true,
    alertThresholds: {
      failedLogins: 5,
      rateLimitExceeded: 10,
      suspiciousActivity: 3
    },
    logRetention: 90, // jours
    realTimeAlerts: true
  },

  // Configuration GDPR
  gdpr: {
    dataRetentionDays: 2555, // 7 ans par défaut
    anonymizeAfterDays: 2920, // 8 ans
    consentRequired: ['data_processing', 'location_tracking'],
    rightToErasure: true,
    dataPortability: true,
    auditTrail: true
  },

  // Backup et récupération
  backup: {
    frequency: 'daily',
    retention: 30, // jours
    encryption: true,
    offsite: true,
    testRestore: 'weekly'
  }
};

// Validation de la configuration
export const validateSecurityConfig = (): boolean => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('Variables d\'environnement manquantes:', missing);
    return false;
  }

  return true;
};

// Middleware de sécurité pour Express (si utilisé côté serveur)
export const securityMiddleware = {
  helmet: {
    contentSecurityPolicy: {
      directives: SECURITY_CONFIG.csp.directives
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: SECURITY_CONFIG.rateLimiting.api.default,
    message: 'Trop de requêtes, veuillez réessayer plus tard.',
    standardHeaders: true,
    legacyHeaders: false
  }
};

// Utilitaires de sécurité
export const securityUtils = {
  // Sanitisation des entrées utilisateur
  sanitizeInput: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },

  // Validation d'email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Génération de token sécurisé
  generateSecureToken: (): string => {
    return crypto.randomUUID();
  },

  // Hash de mot de passe (côté client pour validation)
  validatePasswordStrength: (password: string): {
    isValid: boolean;
    errors: string[];
  } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un caractère spécial');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Configuration de logging sécurisé
export const securityLogging = {
  events: [
    'user_login',
    'user_logout',
    'failed_login',
    'password_change',
    'data_export',
    'admin_action',
    'rate_limit_exceeded',
    'security_violation'
  ],
  
  sensitiveFields: [
    'password',
    'token',
    'secret',
    'key',
    'authorization'
  ],
  
  logLevel: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
};

export default SECURITY_CONFIG;
