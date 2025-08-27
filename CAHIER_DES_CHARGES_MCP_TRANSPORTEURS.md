# Cahier des Charges – OneLog Africa – MCP + Feedback Transporteurs

## 1. Contexte & Objectif

### 1.1 Contexte
Plateforme SaaS pour digitaliser la logistique routière africaine : suivi temps réel, GED, KPI.
Multi-acteurs : transporteurs, logisticiens, clients B2B.
Integration MCP pour centraliser le contexte métier (missions, véhicules, clients, statuts).

### 1.2 Objectifs
- MVP fonctionnel en 4 semaines
- Préparer V1 scalable : IA, automatisation, API ERP/Douanes, notifications intelligentes
- Prendre en compte retours terrain des transporteurs pour UX et opérations

## 2. Phases & Modules

### Phase 1 – MVP Core (Semaines 1-4)

| Module | Fonctionnalité | Notes MCP |
|--------|----------------|-----------|
| **Gestion Missions** | CRUD missions, assignation chauffeur / véhicule / client | MCP centralise statut et historique |
| **Authentification Multi-Rôles** | Admin / Designateur / Chauffeur / Client | Accès conditionnel basé sur MCP |
| **GED minimale** | Upload PDF/images (bons, CMR, EIR), visualisation | MCP stocke métadonnées doc |
| **Suivi Temps Réel** | Carte Leaflet.js, maj GPS manuelle si nécessaire | MCP fournit contexte pour affichage |
| **Notifications Basique** | Email départ / incident / arrivée | MCP fournit contexte pour messages |

### Phase 2 – Intégration Feedback Transporteurs (Semaines 5-6)

| Feature | Description | Audit / Backlog |
|---------|-------------|-----------------|
| **Facturation multi-acteurs & périodique** | - Clients secondaires (donneur d'ordre ≠ destinataire)<br>- Facturation automatique : hebdo / quinzaine / mensuelle<br>- Génération de factures groupées avec justificatifs | Relier à Facturation PDF et Advanced Reporting |
| **Notifications clients maîtrisées** | - Déclenchement manuel possible<br>- Désactivation notifications sur certains jalons<br>- Personnalisation messages | Relier à Notifications Temps Réel et MCP |
| **Suivi grand écran** | - Carte interactive en live pour salle d'exploitation<br>- Vue plein écran / TV murale<br>- Filtres dynamiques par mission, statut, conducteur | Relier à Supervision temps réel, Dashboard Exploitant, MCP |

### Phase 3 – Optimisation IA & Scalabilité (Semaines 7-8)

| Module | Fonctionnalité | Notes MCP |
|--------|----------------|-----------|
| **Dashboard KPI avancé** | Missions, retards, clients, modèles prédictifs | MCP centralise données pour IA |
| **Optimisation itinéraires** | IA prédictive des tournées | MCP fournit contexte en temps réel |
| **Growth & Ops** | Webhooks, feature flags, monitoring, audit trail | MCP centralise logs, événements, triggers |

## 3. Plan d'Action Immediat (Backlog Transporteurs)

| Feature | Tâches Immédiates | Priorité | Responsable | Durée estimée |
|---------|-------------------|----------|-------------|---------------|
| **Facturation multi-acteurs & périodique** | - Ajouter entité "client secondaire"<br>- Implémenter périodicité facturation<br>- Génération factures groupées avec pièces jointes | **P0** | Backend / MCP | 4 jours |
| **Notifications clients maîtrisées** | - Ajouter mode manuel déclenchement<br>- Désactivation sur jalons spécifiques<br>- Personnalisation messages | **P0** | Backend / Frontend / MCP | 3 jours |
| **Suivi grand écran** | - Carte interactive full screen<br>- Filtres dynamiques<br>- Optimiser performance pour grand écran | **P1** | Frontend / MCP | 3 jours |

## 4. Architecture Technique (MVP + Feedback)

### Stack Technique
- **Frontend** : Next.js + Tailwind CSS + shadcn/ui
- **Backend** : Firebase Functions / Firestore (NoSQL) + MCP Layer
- **MCP Core** : centralisation contextuelle pour missions, clients, véhicules, statuts
- **Carto** : Leaflet.js (offline possible)
- **Notifications** : Zapier / MailerSend API, manuel ou automatique
- **GED** : Firebase Storage
- **Sécurité** : OAuth2 Firebase, HTTPS, RBAC via MCP

### Architecture MCP
```
┌─────────────────────────────────────┐
│           MCP Context Layer         │
├─────────────────────────────────────┤
│  Missions  │  Clients  │  Véhicules │
│  Statuts   │  Docs     │  Tracking  │
├─────────────────────────────────────┤
│        Real-time Sync Bus          │
├─────────────────────────────────────┤
│  Firebase / Supabase / Firestore  │
└─────────────────────────────────────┘
```

## 5. Roadmap Consolidée (8 Semaines)

| Sprint | Phase | Modules / Livrables |
|--------|-------|---------------------|
| **Sprint 1 (S1-S2)** | MVP Core | Missions CRUD, Auth, GED, Suivi temps réel, Notifications basiques, MCP Core |
| **Sprint 2 (S3-S4)** | Feedback Transporteurs | Facturation multi-acteurs, Notifications maîtrisées, Suivi grand écran |
| **Sprint 3 (S5-S6)** | Optimisation IA | Dashboard KPI, Optimisation itinéraires, Analytics avancés, Audit trail |
| **Sprint 4 (S7-S8)** | Scalabilité & Growth | Webhooks, Feature flags, Monitoring performance, préparation V1 complète |

## 6. Spécifications Techniques Détaillées

### 6.1 Modèles de Données MCP

```typescript
// Mission MCP Context
interface MissionMCP {
  id: string;
  client_primary: Client;
  client_secondary?: ClientSecondary;
  chauffeur: Chauffeur;
  vehicule: Vehicule;
  statut: MissionStatus;
  documents: DocumentGED[];
  tracking: TrackingPoint[];
  billing: BillingInfo;
  notifications: NotificationConfig;
}

// Client Secondaire (Transporteurs)
interface ClientSecondary {
  id: string;
  name: string;
  type: 'MEDLOG' | 'MAERSK' | 'CUSTOM';
  billing_period: 'weekly' | 'biweekly' | 'monthly';
  payment_terms: number;
  required_documents: DocumentType[];
}
```

### 6.2 API Endpoints MCP

```typescript
// Endpoints pour intégration transporteurs
POST /api/mcp/missions/{id}/billing/generate
POST /api/mcp/notifications/manual-trigger
GET /api/mcp/control-room/live-feed
PUT /api/mcp/missions/{id}/notifications/config
```

### 6.3 Configuration Notifications

```typescript
interface NotificationConfig {
  manual_mode: boolean;
  disabled_triggers: string[];
  custom_messages: Record<string, string>;
  recipients: {
    primary: boolean;
    secondary: boolean;
    client: boolean;
  };
}
```

## 7. Critères d'Acceptation

### 7.1 Facturation Multi-Acteurs
- [ ] Peut créer client secondaire MEDLOG/MAERSK
- [ ] Facturation automatique selon période définie
- [ ] Factures groupées avec pièces jointes PDF
- [ ] Export format standard (PDF + XML)

### 7.2 Notifications Maîtrisées
- [ ] Toggle manuel/automatique par mission
- [ ] Désactivation par type de jalon
- [ ] Personnalisation message via interface
- [ ] Logs de toutes les notifications

### 7.3 Vue Grand Écran
- [ ] Mode plein écran optimisé TV 4K
- [ ] Auto-refresh toutes les 30s
- [ ] Filtres rapides accessibles
- [ ] Performance < 2s chargement

## 8. Dépendances & Prérequis

### 8.1 Dépendances Techniques
- Firebase Admin SDK configuré
- MCP Server opérationnel
- Leaflet.js avec tuiles offline
- API email (MailerSend) configurée

### 8.2 Données Requises
- Historique missions 6 mois minimum
- Données clients secondaires (MEDLOG, MAERSK)
- Templates notifications validés
- Documents types (BL, CMR, EIR)

## 9. Validation & Tests

### 9.1 Tests Transporteurs
- Session démo 30 min avec équipe exploitation
- Test facturation mensuelle avec données réelles
- Validation workflow notifications manuelles
- Test vue grand écran sur TV 55"

### 9.2 Tests Automatisés
- Tests unitaires > 80% coverage
- Tests E2E Cypress sur features transporteurs
- Tests performance (load < 500ms)
- Tests sécurité (OWASP ZAP)

## 10. Livrables

### 10.1 Documentation
- Guide utilisateur transporteurs (FR/EN)
- API documentation (OpenAPI 3.0)
- Guide déploiement MCP
- Guide maintenance

### 10.2 Assets
- Templates factures (PDF + HTML)
- Templates notifications (email)
- Configuration Leaflet.js
- Scripts déploiement Docker

✅ **Résultat attendu** : Cahier des charges simplifié, phase par phase, avec intégration MCP et feedback transporteurs, prêt pour exécution immédiate par l'IA codeuse.
