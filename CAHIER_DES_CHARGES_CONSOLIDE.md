# 📘 Cahier des Charges Consolidé – OneLog Africa Voyage Tracker

## 1. Contexte & Objectifs

### 1.1 Contexte
Secteur logistique africain avec besoin urgent d'outils digitaux : suivi réel, GED, KPI.
Croissance des missions routières (vrac, conteneurs, hors gabarit).

### 1.2 Objectifs
- Lancer un MVP fonctionnel en 4 semaines pour valider le besoin terrain
- Plateforme SaaS multi-acteurs : transporteurs, logisticiens, clients B2B
- Préparer une V1 scalable avec IA, automatisation, connecteurs API (ERP, Douanes)
- Intégrer MCP comme structure centralisée pour cohérence métier

## 2. Architecture Fonctionnelle – MCP

### 2.1 Structure MCP recommandée
```typescript
interface MCPContext {
  missions: MissionContext;
  clients: ClientContext;
  vehicles: VehicleContext;
  documents: DocumentContext;
  billing: BillingContext;
  notifications: NotificationContext;
}
```

### 2.2 Notes clés
- Tous les modules interagissent via MCP → single source of truth
- Traçabilité complète pour missions, clients, véhicules, documents, facturation, notifications
- Supporte les fonctionnalités demandées par les transporteurs : facturation multi-acteurs, notifications maîtrisées, suivi sur grand écran

## 3. Phases du Projet & Modules

| Phase | Description | Modules / Fonctionnalités |
|-------|-------------|---------------------------|
| **Phase 1 – MVP / 4 semaines** | Test terrain rapide | Missions CRUD, Auth multi-rôles, GED minimale, Notifications de base, Suivi simplifié GPS, Dashboard Admin/Client/Chauffeur/Exploitant |
| **Phase 2 – Intégration MCP & Feedback Transporteurs** | Consolidation | Facturation multi-acteurs & périodique, Notifications clients personnalisables, Vue grand écran de supervision, KPI de base, Assignation automatique via MCP |
| **Phase 3 – Modules évolutifs / Post-MVP** | Extension | Optimisation IA des tournées, Intégration API ERP/Douanes/Transitaire, Dashboard KPI avancé, Modules CO2 / Durabilité / Assurance, Analytics avancés |
| **Phase 4 – Growth & Scalabilité** | Préparation V2 | Offline Mode, Multi-langues, Chat temps réel, Paiement en ligne, Webhooks API, Feature flags, AB testing, Audit Trail complet |

## 4. Spécifications Fonctionnelles – Phase 1 & 2

| Fonctionnalité | Description | Statut Audit | Priorité |
|----------------|-------------|--------------|----------|
| **Missions CRUD** | Création, modification, clôture missions, checklist | ✅ | P0 |
| **Auth Multi-Rôles** | Admin, Exploitant, Chauffeur, Client | ✅ | P0 |
| **GED** | Upload PDF/Images (CMR, EIR, Bons), visualisation | ✅ | P0 |
| **Facturation Multi-Acteurs** | Donneur d'ordre ≠ destinataire, périodique, factures groupées | ⚠️ | P0 |
| **Notifications Maîtrisées** | Mode manuel, désactivation automatique, messages personnalisés | ⚠️ | P0 |
| **Suivi Temps Réel** | Carte interactive, filtres dynamiques, vue grand écran | ⚠️ | P0 |
| **Dashboard** | Admin/Client/Chauffeur/Exploitant | ✅ | P0 |
| **KPI & Reporting** | Statistiques de base | ✅ | P1 |

## 5. Architecture Technique

| Composant | Technologie | Notes |
|-----------|-------------|--------|
| **Frontend** | Next.js + Tailwind CSS + shadcn/ui | Composants réutilisables, responsive |
| **Backend** | Firebase Functions / Firestore | NoSQL, intégration MCP |
| **Cartographie** | Leaflet.js | Offline possible, live tracking |
| **Notifications** | Zapier / MailerSend API | Emails, SMS, WhatsApp |
| **Stockage GED** | Firebase Storage | Documents et justificatifs |
| **Auth & Sécurité** | Firebase OAuth2 | Rôles, HTTPS, RLS |
| **CI/CD** | GitHub Actions | Tests unitaires et E2E |

## 6. Backlog de Complétude – Priorité Phase 1-2

| Feature | Tâches | Priorité | Effort Estimé |
|---------|--------|----------|---------------|
| **Facturation Multi-Acteurs** | Clients secondaires, périodique, groupage factures | P0 | 5j |
| **Notifications Maîtrisées** | Mode manuel, personnalisation messages, désactivation jalons | P0 | 3j |
| **Suivi Grand Écran** | Carte live, filtres dynamiques, mode plein écran | P0 | 4j |
| **Dark Mode** | Toggle UI | P1 | 2j |
| **Offline Mode** | Service worker, sync | P1 | 5j |
| **Multi-langues** | i18n FR/EN | P1 | 3j |
| **Audit Trail** | Tables audit, triggers, UI | P0 | 5j |

## 7. Découpage Sprints (4 x 2 Semaines)

| Sprint | Objectif | Modules Livrables |
|--------|----------|-------------------|
| **Sprint 1** | Fondation & MVP Core | Auth Multi-Rôles, CRUD Missions, GED minimale, Dashboard |
| **Sprint 2** | MCP & Feedback Transporteurs | Facturation Multi-Acteurs, Notifications Maîtrisées, Suivi grand écran |
| **Sprint 3** | Modules évolutifs | Optimisation IA, API ERP/Douanes, KPI avancés, Modules CO2/Durabilité |
| **Sprint 4** | Growth & Scalabilité | Offline Mode, Multi-langues, Chat temps réel, Paiement en ligne, Webhooks, Feature flags, AB testing |

## 8. Dashboard Visuel de Complétude (Phase 1-2)

| Domaine | Modules | Complétude Audit | Statut |
|---------|---------|------------------|--------|
| **Missions & Opérations** | CRUD Missions, Checklist | 100% | ✅ |
| **Auth & Rôles** | Multi-Rôles | 100% | ✅ |
| **GED** | Upload & visualisation | 80% | ⚠️ |
| **Facturation** | Multi-acteurs & périodique | 0% | ⚠️ |
| **Notifications** | Client & interne | 20% | ⚠️ |
| **Suivi Temps Réel** | Carte, filtres, plein écran | 30% | ⚠️ |
| **Dashboard** | Admin/Client/Chauffeur/Exploitant | 100% | ✅ |

## 9. Architecture MCP Recommandée

```typescript
// Structure MCP consolidée
interface MCPContext {
  missions: {
    create: (data: MissionData) => Promise<Mission>;
    update: (id: string, data: Partial<MissionData>) => Promise<Mission>;
    status: (id: string) => Promise<MissionStatus>;
    history: (id: string) => Promise<MissionHistory[]>;
  };
  
  clients: {
    primary: ClientContext;
    secondary: ClientSecondaryContext; // Transporteurs MEDLOG/MAERSK
    billing: BillingContext;
  };
  
  vehicles: {
    tracking: (vehicleId: string) => Promise<TrackingPoint[]>;
    assignments: (vehicleId: string) => Promise<Mission[]>;
  };
  
  documents: {
    upload: (file: File, metadata: DocumentMetadata) => Promise<Document>;
    generate: (type: DocumentType, missionId: string) => Promise<Document>;
    attach: (documentId: string, missionId: string) => Promise<void>;
  };
  
  notifications: {
    trigger: (event: NotificationEvent, context: MCPContext) => Promise<void>;
    manual: (config: ManualNotificationConfig) => Promise<void>;
    disable: (missionId: string, triggers: string[]) => Promise<void>;
  };
}
```

## 10. Stack Technique Optimisée

```diff
- Backend : Firebase Functions / Firestore
+ Backend : Supabase (déjà en place) + MCP Layer
- Carto : Leaflet.js  
+ Carto : Google Maps (déjà intégré) avec offline mode
- Notifications : Zapier / MailerSend
+ Notifications : Service existant + MCP integration
```

## 11. Plan d'Exécution Immédiat

### Semaine 1-2 : Feedback Transporteurs
```bash
# Priorité P0
Day 1-2: Facturation multi-acteurs (backend + UI)
Day 3-4: Notifications maîtrisées (toggle + personnalisation)
Day 5: Vue grand écran (optimisation + filtres)
Day 6-7: Tests transporteurs + validation
```

### Semaine 3-4 : MCP Core Integration
```bash
# Priorité P1
Day 8-10: MCP Context Layer setup
Day 11-12: Intégration données transporteurs
Day 13-14: Tests E2E + déploiement staging
```

## 12. Critères d'Acceptation MVP

### 12.1 Facturation Multi-Acteurs
- [ ] Création client secondaire (MEDLOG/MAERSK)
- [ ] Facturation automatique selon période définie
- [ ] Factures groupées avec pièces jointes PDF
- [ ] Export format standard (PDF + XML)

### 12.2 Notifications Maîtrisées  
- [ ] Toggle manuel/automatique par mission
- [ ] Désactivation par type de jalon
- [ ] Personnalisation message via interface
- [ ] Logs de toutes les notifications

### 12.3 Vue Grand Écran
- [ ] Mode plein écran optimisé TV 4K
- [ ] Auto-refresh toutes les 30s
- [ ] Filtres rapides accessibles
- [ ] Performance < 2s chargement

✅ **Résultat attendu** : MVP fonctionnel avec feedback transporteurs intégré, prêt pour validation terrain en 4 semaines.
