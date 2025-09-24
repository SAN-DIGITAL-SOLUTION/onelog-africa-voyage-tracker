-- Script SQL de seed QA pour Supabase OneLog Africa
-- Nettoyage des tables (optionnel, à activer en QA uniquement)
DELETE FROM tracking;
DELETE FROM incidents;
DELETE FROM missions;
DELETE FROM demandes;
DELETE FROM profiles;

-- Création de profils
INSERT INTO profiles (id, email, role, nom, prenom, phone) VALUES
  ('client-uuid-1', 'client1@onelog.test', 'client', 'Diallo', 'Fatou', '+221700000001'),
  ('exploitant-uuid-1', 'exploitant1@onelog.test', 'exploitant', 'Sow', 'Moussa', '+221700000002'),
  ('chauffeur-uuid-1', 'chauffeur1@onelog.test', 'chauffeur', 'Diop', 'Amadou', '+221700000003');

-- Création de demandes
INSERT INTO demandes (id, user_id, typeMarchandise, volume, adresseDepart, adresseArrivee, dateSouhaitee, status, trackingId)
VALUES
  ('demande-uuid-1', 'client-uuid-1', 'Fret', 10, 'Dakar', 'Thiès', '2025-07-01', 'en_attente', 'TRK-001'),
  ('demande-uuid-2', 'client-uuid-1', 'Colis', 2, 'Dakar', 'Saint-Louis', '2025-07-02', 'validée', 'TRK-002');

-- Création de missions
INSERT INTO missions (id, demande_id, chauffeur_id, status, created_at)
VALUES
  ('mission-uuid-1', 'demande-uuid-2', 'chauffeur-uuid-1', 'en_attente', NOW());

-- Incident exemple
INSERT INTO incidents (id, mission_id, chauffeur_id, description, created_at)
VALUES ('incident-uuid-1', 'mission-uuid-1', 'chauffeur-uuid-1', 'Pneu crevé sur la route.', NOW());

-- Tracking exemple
INSERT INTO tracking (id, mission_id, lat, lng, timestamp)
VALUES ('track-uuid-1', 'mission-uuid-1', 14.6928, -17.4467, NOW());
