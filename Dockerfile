# Étape 1 : Build de l'application
FROM node:20-alpine AS builder

# Créer le répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY package.json package-lock.json ./

# Installer les dépendances de production uniquement
RUN npm install -g npm@11 && npm ci --only=production --legacy-peer-deps

# Copier le reste du code
COPY . .

# Construire l’application Next.js
RUN npm run build

# Étape 2 : Image légère pour exécution en production
FROM node:20-alpine AS runner

# Créer un utilisateur non root
RUN addgroup --system app && adduser --system --ingroup app app

WORKDIR /app

# Copier uniquement le build depuis l'étape précédente
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

# Définir les permissions
RUN chown -R app:app /app

USER app

# Démarrer l’app
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000
CMD ["npm", "start"]
