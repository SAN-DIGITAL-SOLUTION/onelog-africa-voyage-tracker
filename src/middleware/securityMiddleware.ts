import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { SECURITY_CONFIG, securityUtils } from '@/config/security.config';
import { supabase } from '@/integrations/supabase/client';

// Interface pour les requêtes avec utilisateur authentifié
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Rate limiting par endpoint
export const createRateLimit = (type: keyof typeof SECURITY_CONFIG.rateLimiting.api) => {
  return rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: SECURITY_CONFIG.rateLimiting.api[type],
    message: {
      error: 'Trop de requêtes',
      message: 'Limite de taux dépassée, veuillez réessayer plus tard.',
      retryAfter: 60
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: Request) => {
      // Utiliser l'IP + user ID si authentifié pour un rate limiting plus précis
      const userKey = (req as AuthenticatedRequest).user?.id || '';
      return `${req.ip}-${userKey}`;
    },
    handler: (req: Request, res: Response) => {
      // Logger les tentatives de dépassement de limite
      console.warn(`Rate limit exceeded for IP: ${req.ip}, endpoint: ${req.path}`);
      
      res.status(429).json({
        error: 'Trop de requêtes',
        message: 'Limite de taux dépassée, veuillez réessayer plus tard.',
        retryAfter: 60
      });
    }
  });
};

// Rate limits spécialisés
export const authRateLimit = createRateLimit('auth');
export const apiRateLimit = createRateLimit('default');
export const uploadRateLimit = createRateLimit('upload');
export const exportRateLimit = createRateLimit('export');
export const sensitiveRateLimit = createRateLimit('sensitive');

// Configuration Helmet pour la sécurité des headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: SECURITY_CONFIG.csp.directives,
    reportOnly: false
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
});

// Middleware de validation des entrées
export const inputValidation = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitiser les paramètres de requête
    if (req.query) {
      Object.keys(req.query).forEach(key => {
        if (typeof req.query[key] === 'string') {
          req.query[key] = securityUtils.sanitizeInput(req.query[key] as string);
        }
      });
    }

    // Sanitiser le body si c'est un objet
    if (req.body && typeof req.body === 'object') {
      sanitizeObject(req.body);
    }

    // Valider la taille de la requête
    const contentLength = parseInt(req.get('content-length') || '0');
    if (contentLength > SECURITY_CONFIG.validation.maxRequestSize) {
      return res.status(413).json({
        error: 'Requête trop volumineuse',
        message: 'La taille de la requête dépasse la limite autorisée'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur de validation des entrées:', error);
    res.status(400).json({
      error: 'Données invalides',
      message: 'Les données fournies ne sont pas valides'
    });
  }
};

// Fonction récursive pour sanitiser les objets
const sanitizeObject = (obj: any): void => {
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      obj[key] = securityUtils.sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  });
};

// Middleware d'authentification JWT
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        error: 'Token manquant',
        message: 'Token d\'authentification requis'
      });
    }

    // Vérifier le token avec Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(403).json({
        error: 'Token invalide',
        message: 'Token d\'authentification invalide ou expiré'
      });
    }

    // Récupérer le rôle utilisateur
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    req.user = {
      id: user.id,
      email: user.email || '',
      role: userRole?.role || 'user'
    };

    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({
      error: 'Erreur d\'authentification',
      message: 'Erreur lors de la vérification du token'
    });
  }
};

// Middleware d'autorisation par rôle
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Non authentifié',
        message: 'Authentification requise'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Permissions insuffisantes pour cette action'
      });
    }

    next();
  };
};

// Middleware de logging sécurisé
export const securityLogger = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Logger la requête
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    userEmail: req.user?.email,
    userRole: req.user?.role
  };

  // Ne pas logger les données sensibles
  const sanitizedBody = { ...req.body };
  SECURITY_CONFIG.securityLogging.sensitiveFields.forEach(field => {
    if (sanitizedBody[field]) {
      sanitizedBody[field] = '[REDACTED]';
    }
  });

  console.log('Security Log:', {
    ...logData,
    body: Object.keys(sanitizedBody).length > 0 ? sanitizedBody : undefined
  });

  // Logger la réponse
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    console.log('Security Response Log:', {
      ...logData,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      success: res.statusCode < 400
    });

    // Alertes pour les événements suspects
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn('Security Alert: Unauthorized access attempt', {
        ip: req.ip,
        url: req.url,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
  });

  next();
};

// Middleware de protection CSRF
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Vérifier que les requêtes POST/PUT/DELETE ont un token CSRF valide
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    
    if (!csrfToken) {
      return res.status(403).json({
        error: 'Token CSRF manquant',
        message: 'Token CSRF requis pour cette action'
      });
    }

    // Validation du token CSRF (implémentation simplifiée)
    // En production, utiliser une bibliothèque comme csurf
    const expectedToken = req.session?.csrfToken;
    if (csrfToken !== expectedToken) {
      return res.status(403).json({
        error: 'Token CSRF invalide',
        message: 'Token CSRF invalide ou expiré'
      });
    }
  }

  next();
};

// Middleware de validation des fichiers uploadés
export const fileValidation = (req: Request, res: Response, next: NextFunction) => {
  if (req.files || req.file) {
    const files = Array.isArray(req.files) ? req.files : [req.file];
    
    for (const file of files) {
      if (!file) continue;
      
      // Vérifier la taille
      if (file.size > SECURITY_CONFIG.validation.maxFileSize) {
        return res.status(413).json({
          error: 'Fichier trop volumineux',
          message: `La taille du fichier ne doit pas dépasser ${SECURITY_CONFIG.validation.maxFileSize / (1024 * 1024)}MB`
        });
      }

      // Vérifier le type MIME
      if (!SECURITY_CONFIG.validation.allowedFileTypes.includes(file.mimetype)) {
        return res.status(415).json({
          error: 'Type de fichier non autorisé',
          message: 'Ce type de fichier n\'est pas autorisé'
        });
      }
    }
  }

  next();
};

// Middleware de détection d'intrusion simple
export const intrusionDetection = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\<|\%3C)script(\>|\%3E)/i,
    /javascript:/i,
    /vbscript:/i,
    /onload\s*=/i,
    /onerror\s*=/i,
    /(union|select|insert|delete|update|drop|create|alter)\s+/i,
    /(\||;|\&\&|\|\|)/,
    /\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i
  ];

  const requestString = JSON.stringify({
    url: req.url,
    query: req.query,
    body: req.body,
    headers: req.headers
  });

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestString)) {
      console.error('Security Alert: Suspicious request detected', {
        ip: req.ip,
        url: req.url,
        pattern: pattern.toString(),
        timestamp: new Date().toISOString()
      });

      return res.status(400).json({
        error: 'Requête suspecte détectée',
        message: 'Cette requête contient des éléments suspects'
      });
    }
  }

  next();
};

// Export de tous les middlewares
export const securityMiddlewares = {
  helmet: helmetConfig,
  rateLimit: {
    auth: authRateLimit,
    api: apiRateLimit,
    upload: uploadRateLimit,
    export: exportRateLimit,
    sensitive: sensitiveRateLimit
  },
  inputValidation,
  authenticateToken,
  requireRole,
  securityLogger,
  csrfProtection,
  fileValidation,
  intrusionDetection
};

export default securityMiddlewares;
