# Multi-stage build pour OneLog Africa - Vite + React
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Copier les modules node
COPY node_modules ./node_modules

# Copier le code source
COPY . .

# Installer toutes les dépendances (dev incluses pour le build)
RUN npm ci

# Build de l'application Vite
RUN npm run build

# Étape 2 : Serveur Nginx pour servir les fichiers statiques
FROM nginx:alpine

# Copier les fichiers buildés depuis l'étape précédente
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Installer PHP-FPM pour les endpoints PHP
RUN apk add --no-cache php81 php81-fpm php81-mysqli php81-json php81-curl

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
