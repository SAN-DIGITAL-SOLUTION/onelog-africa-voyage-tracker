-- Audit de Performance Supabase - OneLog Africa Phase 2
-- Analyse complète des requêtes, indices et RLS policies

-- ================================================
-- 1. ANALYSE DES TABLES ET VOLUMES
-- ================================================

-- Taille des tables principales
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_stat_get_tuples_returned(c.oid) as tuples_returned,
    pg_stat_get_tuples_fetched(c.oid) as tuples_fetched,
    pg_stat_get_tuples_inserted(c.oid) as tuples_inserted,
    pg_stat_get_tuples_updated(c.oid) as tuples_updated,
    pg_stat_get_tuples_deleted(c.oid) as tuples_deleted
FROM pg_tables pt
JOIN pg_class c ON c.relname = pt.tablename
WHERE schemaname = 'public'
AND tablename IN ('missions', 'tracking_points', 'profiles', 'user_roles', 'notifications', 'invoices')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ================================================
-- 2. ANALYSE DES INDICES EXISTANTS
-- ================================================

-- Indices sur les tables critiques
SELECT 
    t.tablename,
    i.indexname,
    i.indexdef,
    pg_size_pretty(pg_relation_size(i.indexname::regclass)) as index_size,
    s.idx_scan as times_used,
    s.idx_tup_read as tuples_read,
    s.idx_tup_fetch as tuples_fetched
FROM pg_tables t
LEFT JOIN pg_indexes i ON t.tablename = i.tablename
LEFT JOIN pg_stat_user_indexes s ON i.indexname = s.indexrelname
WHERE t.schemaname = 'public'
AND t.tablename IN ('missions', 'tracking_points', 'profiles', 'user_roles', 'notifications', 'invoices')
ORDER BY t.tablename, s.idx_scan DESC NULLS LAST;

-- ================================================
-- 3. REQUÊTES LENTES POTENTIELLES
-- ================================================

-- Analyse des requêtes sur missions (table critique)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT m.*, p.full_name as client_name, v.plate_number
FROM missions m
LEFT JOIN profiles p ON m.client_id = p.id
LEFT JOIN vehicles v ON m.vehicle_id = v.id
WHERE m.status IN ('pending', 'in_progress')
ORDER BY m.created_at DESC
LIMIT 50;

-- Analyse des requêtes sur tracking_points (volume élevé)
EXPLAIN (ANALYZE, BUFFERS)
SELECT tp.*, m.reference as mission_ref
FROM tracking_points tp
JOIN missions m ON tp.mission_id = m.id
WHERE tp.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY tp.created_at DESC
LIMIT 100;

-- ================================================
-- 4. RECOMMANDATIONS D'INDICES
-- ================================================

-- Indices recommandés pour optimisation
DO $$
BEGIN
    -- Index composite pour missions par status et date
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_missions_status_created_at') THEN
        EXECUTE 'CREATE INDEX idx_missions_status_created_at ON missions(status, created_at DESC)';
        RAISE NOTICE 'Index créé: idx_missions_status_created_at';
    END IF;
    
    -- Index pour tracking_points par mission et date
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tracking_points_mission_created') THEN
        EXECUTE 'CREATE INDEX idx_tracking_points_mission_created ON tracking_points(mission_id, created_at DESC)';
        RAISE NOTICE 'Index créé: idx_tracking_points_mission_created';
    END IF;
    
    -- Index pour notifications par utilisateur et statut
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_status') THEN
        EXECUTE 'CREATE INDEX idx_notifications_user_status ON notifications(user_id, status, created_at DESC)';
        RAISE NOTICE 'Index créé: idx_notifications_user_status';
    END IF;
    
    -- Index pour invoices par client et période
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_client_period') THEN
        EXECUTE 'CREATE INDEX idx_invoices_client_period ON invoices(client_id, billing_period, created_at DESC)';
        RAISE NOTICE 'Index créé: idx_invoices_client_period';
    END IF;
    
    -- Index partiel pour missions actives seulement
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_missions_active') THEN
        EXECUTE 'CREATE INDEX idx_missions_active ON missions(id, status, updated_at) WHERE status IN (''pending'', ''in_progress'')';
        RAISE NOTICE 'Index partiel créé: idx_missions_active';
    END IF;
END $$;

-- ================================================
-- 5. ANALYSE DES RLS POLICIES
-- ================================================

-- Vérification des policies RLS actives
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('missions', 'tracking_points', 'profiles', 'user_roles', 'notifications', 'invoices')
ORDER BY tablename, policyname;

-- ================================================
-- 6. STATISTIQUES DE PERFORMANCE
-- ================================================

-- Statistiques d'utilisation des tables
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    n_tup_ins,
    n_tup_upd,
    n_tup_del,
    n_tup_hot_upd,
    n_live_tup,
    n_dead_tup,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
AND tablename IN ('missions', 'tracking_points', 'profiles', 'user_roles', 'notifications', 'invoices')
ORDER BY seq_scan DESC;

-- ================================================
-- 7. RECOMMANDATIONS D'OPTIMISATION
-- ================================================

-- Analyse des tables nécessitant un VACUUM
SELECT 
    tablename,
    n_dead_tup,
    n_live_tup,
    ROUND(n_dead_tup * 100.0 / GREATEST(n_live_tup + n_dead_tup, 1), 2) as dead_tuple_percent,
    last_autovacuum
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
AND n_dead_tup > 1000
ORDER BY dead_tuple_percent DESC;

-- Recommandations finales
DO $$
BEGIN
    RAISE NOTICE '=== RECOMMANDATIONS PERFORMANCE ===';
    RAISE NOTICE '1. Indices créés pour optimiser les requêtes fréquentes';
    RAISE NOTICE '2. Vérifier les RLS policies pour éviter les full scans';
    RAISE NOTICE '3. Programmer VACUUM/ANALYZE réguliers pour les tables volumineuses';
    RAISE NOTICE '4. Considérer le partitioning pour tracking_points si > 1M lignes';
    RAISE NOTICE '5. Mettre en place un monitoring des requêtes lentes';
    RAISE NOTICE '=== FIN AUDIT PERFORMANCE ===';
END $$;
