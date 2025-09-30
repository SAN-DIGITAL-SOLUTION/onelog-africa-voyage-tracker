-- Migration pour implémenter l'audit trail et la compliance GDPR
-- Créé le: 2025-09-09
-- Objectif: Traçabilité complète des actions et conformité GDPR

-- 1. Table principale d'audit trail
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email TEXT,
    user_role TEXT,
    action_type TEXT NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT, etc.
    resource_type TEXT NOT NULL, -- missions, users, invoices, etc.
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Index pour performance
    CONSTRAINT audit_logs_action_type_check CHECK (action_type IN (
        'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'EXPORT', 
        'IMPORT', 'VIEW', 'DOWNLOAD', 'SHARE', 'APPROVE', 'REJECT'
    ))
);

-- Index pour optimiser les requêtes d'audit
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- 2. Table pour la gestion des consentements GDPR
CREATE TABLE IF NOT EXISTS gdpr_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL, -- data_processing, marketing, analytics, cookies
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    consent_date TIMESTAMPTZ DEFAULT NOW(),
    withdrawal_date TIMESTAMPTZ,
    ip_address INET,
    user_agent TEXT,
    consent_version TEXT DEFAULT '1.0',
    legal_basis TEXT, -- consent, contract, legal_obligation, vital_interests, public_task, legitimate_interests
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT gdpr_consents_type_check CHECK (consent_type IN (
        'data_processing', 'marketing', 'analytics', 'cookies', 'location_tracking'
    ))
);

-- Index pour les consentements
CREATE INDEX IF NOT EXISTS idx_gdpr_consents_user_id ON gdpr_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_consents_type ON gdpr_consents(consent_type);

-- 3. Table pour les demandes de droits GDPR
CREATE TABLE IF NOT EXISTS gdpr_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type TEXT NOT NULL, -- access, rectification, erasure, portability, restriction, objection
    status TEXT DEFAULT 'pending', -- pending, in_progress, completed, rejected
    request_date TIMESTAMPTZ DEFAULT NOW(),
    completion_date TIMESTAMPTZ,
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    description TEXT,
    response_data JSONB,
    rejection_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    CONSTRAINT gdpr_requests_type_check CHECK (request_type IN (
        'access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'
    )),
    CONSTRAINT gdpr_requests_status_check CHECK (status IN (
        'pending', 'in_progress', 'completed', 'rejected'
    ))
);

-- Index pour les demandes GDPR
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_user_id ON gdpr_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX IF NOT EXISTS idx_gdpr_requests_date ON gdpr_requests(request_date DESC);

-- 4. Table pour la rétention des données
CREATE TABLE IF NOT EXISTS data_retention_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    retention_period_days INTEGER NOT NULL,
    deletion_criteria JSONB,
    last_cleanup TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Politiques de rétention par défaut
INSERT INTO data_retention_policies (table_name, retention_period_days, deletion_criteria) VALUES
('audit_logs', 2555, '{"keep_critical": true}'), -- 7 ans pour audit
('tracking_points', 1095, '{"completed_missions_only": true}'), -- 3 ans pour géolocalisation
('notifications', 365, '{"read": true}'), -- 1 an pour notifications lues
('gdpr_requests', 2555, '{"completed": true}') -- 7 ans pour demandes GDPR
ON CONFLICT DO NOTHING;

-- 5. Fonction pour créer automatiquement des logs d'audit
CREATE OR REPLACE FUNCTION create_audit_log(
    p_user_id UUID,
    p_action_type TEXT,
    p_resource_type TEXT,
    p_resource_id TEXT DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
    user_info RECORD;
BEGIN
    -- Récupérer les informations utilisateur
    SELECT email, 
           COALESCE((SELECT role FROM user_roles WHERE user_id = auth.uid() LIMIT 1), 'unknown') as role
    INTO user_info
    FROM auth.users 
    WHERE id = p_user_id;
    
    -- Insérer le log d'audit
    INSERT INTO audit_logs (
        user_id, user_email, user_role, action_type, resource_type, 
        resource_id, old_values, new_values, metadata
    ) VALUES (
        p_user_id, user_info.email, user_info.role, p_action_type, 
        p_resource_type, p_resource_id, p_old_values, p_new_values, p_metadata
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Triggers automatiques pour l'audit trail sur les tables critiques

-- Trigger pour la table missions
CREATE OR REPLACE FUNCTION audit_missions_changes() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM create_audit_log(
            auth.uid(),
            'CREATE',
            'missions',
            NEW.id::text,
            NULL,
            to_jsonb(NEW),
            '{"table": "missions"}'::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM create_audit_log(
            auth.uid(),
            'UPDATE',
            'missions',
            NEW.id::text,
            to_jsonb(OLD),
            to_jsonb(NEW),
            '{"table": "missions"}'::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM create_audit_log(
            auth.uid(),
            'DELETE',
            'missions',
            OLD.id::text,
            to_jsonb(OLD),
            NULL,
            '{"table": "missions"}'::jsonb
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger sur missions
DROP TRIGGER IF EXISTS trigger_audit_missions ON missions;
CREATE TRIGGER trigger_audit_missions
    AFTER INSERT OR UPDATE OR DELETE ON missions
    FOR EACH ROW EXECUTE FUNCTION audit_missions_changes();

-- Trigger pour la table users (profils)
CREATE OR REPLACE FUNCTION audit_profiles_changes() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM create_audit_log(
            NEW.id,
            'CREATE',
            'profiles',
            NEW.id::text,
            NULL,
            to_jsonb(NEW),
            '{"table": "profiles"}'::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM create_audit_log(
            NEW.id,
            'UPDATE',
            'profiles',
            NEW.id::text,
            to_jsonb(OLD),
            to_jsonb(NEW),
            '{"table": "profiles"}'::jsonb
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM create_audit_log(
            OLD.id,
            'DELETE',
            'profiles',
            OLD.id::text,
            to_jsonb(OLD),
            NULL,
            '{"table": "profiles"}'::jsonb
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Appliquer le trigger sur profiles (si la table existe)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP TRIGGER IF EXISTS trigger_audit_profiles ON profiles;
        CREATE TRIGGER trigger_audit_profiles
            AFTER INSERT OR UPDATE OR DELETE ON profiles
            FOR EACH ROW EXECUTE FUNCTION audit_profiles_changes();
    END IF;
END $$;

-- 7. Fonction pour exporter les données utilisateur (droit d'accès GDPR)
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    user_data JSONB := '{}'::jsonb;
    profile_data JSONB;
    missions_data JSONB;
    notifications_data JSONB;
    audit_data JSONB;
BEGIN
    -- Vérifier les permissions
    IF auth.uid() != target_user_id AND 
       NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;
    
    -- Données du profil utilisateur
    SELECT to_jsonb(u.*) INTO profile_data
    FROM auth.users u
    WHERE u.id = target_user_id;
    
    user_data := jsonb_set(user_data, '{profile}', COALESCE(profile_data, '{}'::jsonb));
    
    -- Missions de l'utilisateur
    SELECT jsonb_agg(to_jsonb(m.*)) INTO missions_data
    FROM missions m
    WHERE m.client_id = target_user_id OR m.driver_id = target_user_id;
    
    user_data := jsonb_set(user_data, '{missions}', COALESCE(missions_data, '[]'::jsonb));
    
    -- Notifications
    SELECT jsonb_agg(to_jsonb(n.*)) INTO notifications_data
    FROM notifications n
    WHERE n.user_id = target_user_id;
    
    user_data := jsonb_set(user_data, '{notifications}', COALESCE(notifications_data, '[]'::jsonb));
    
    -- Logs d'audit (derniers 90 jours)
    SELECT jsonb_agg(to_jsonb(a.*)) INTO audit_data
    FROM audit_logs a
    WHERE a.user_id = target_user_id 
    AND a.timestamp > NOW() - INTERVAL '90 days';
    
    user_data := jsonb_set(user_data, '{audit_logs}', COALESCE(audit_data, '[]'::jsonb));
    
    -- Enregistrer la demande d'export
    PERFORM create_audit_log(
        auth.uid(),
        'EXPORT',
        'user_data',
        target_user_id::text,
        NULL,
        '{"exported_at": "' || NOW()::text || '"}'::jsonb,
        '{"gdpr_request": true}'::jsonb
    );
    
    RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Fonction pour supprimer les données utilisateur (droit à l'effacement)
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id UUID, keep_audit BOOLEAN DEFAULT TRUE)
RETURNS BOOLEAN AS $$
DECLARE
    tables_to_clean TEXT[] := ARRAY['missions', 'notifications', 'tracking_points', 'gdpr_consents'];
    table_name TEXT;
BEGIN
    -- Vérifier les permissions (admin seulement)
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Seuls les administrateurs peuvent supprimer des données utilisateur';
    END IF;
    
    -- Log de la demande de suppression
    PERFORM create_audit_log(
        auth.uid(),
        'DELETE',
        'user_data_gdpr',
        target_user_id::text,
        NULL,
        '{"deletion_requested": true, "keep_audit": ' || keep_audit::text || '}'::jsonb,
        '{"gdpr_erasure": true}'::jsonb
    );
    
    -- Anonymiser plutôt que supprimer pour préserver l'intégrité référentielle
    FOREACH table_name IN ARRAY tables_to_clean
    LOOP
        CASE table_name
            WHEN 'missions' THEN
                UPDATE missions SET 
                    client_id = NULL,
                    driver_id = CASE WHEN driver_id = target_user_id THEN NULL ELSE driver_id END,
                    client_name = 'Utilisateur supprimé',
                    client_phone = NULL,
                    client_email = NULL
                WHERE client_id = target_user_id;
                
            WHEN 'notifications' THEN
                DELETE FROM notifications WHERE user_id = target_user_id;
                
            WHEN 'tracking_points' THEN
                -- Garder les points de tracking pour l'historique mais anonymiser
                UPDATE tracking_points SET metadata = '{}'::jsonb 
                WHERE mission_id IN (
                    SELECT id FROM missions WHERE client_id = target_user_id OR driver_id = target_user_id
                );
                
            WHEN 'gdpr_consents' THEN
                DELETE FROM gdpr_consents WHERE user_id = target_user_id;
        END CASE;
    END LOOP;
    
    -- Anonymiser les logs d'audit si demandé
    IF NOT keep_audit THEN
        UPDATE audit_logs SET 
            user_email = 'deleted@user.com',
            user_agent = NULL,
            ip_address = NULL
        WHERE user_id = target_user_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Fonction de nettoyage automatique selon les politiques de rétention
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER AS $$
DECLARE
    policy RECORD;
    deleted_count INTEGER := 0;
    total_deleted INTEGER := 0;
BEGIN
    FOR policy IN SELECT * FROM data_retention_policies WHERE is_active = TRUE
    LOOP
        CASE policy.table_name
            WHEN 'audit_logs' THEN
                DELETE FROM audit_logs 
                WHERE timestamp < NOW() - (policy.retention_period_days || ' days')::INTERVAL
                AND NOT (metadata->>'keep_critical')::BOOLEAN;
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
            WHEN 'tracking_points' THEN
                DELETE FROM tracking_points tp
                WHERE tp.timestamp < NOW() - (policy.retention_period_days || ' days')::INTERVAL
                AND EXISTS (
                    SELECT 1 FROM missions m 
                    WHERE m.id = tp.mission_id AND m.status = 'completed'
                );
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
                
            WHEN 'notifications' THEN
                DELETE FROM notifications 
                WHERE created_at < NOW() - (policy.retention_period_days || ' days')::INTERVAL
                AND read_at IS NOT NULL;
                GET DIAGNOSTICS deleted_count = ROW_COUNT;
        END CASE;
        
        total_deleted := total_deleted + deleted_count;
        
        -- Mettre à jour la date de dernier nettoyage
        UPDATE data_retention_policies 
        SET last_cleanup = NOW() 
        WHERE id = policy.id;
    END LOOP;
    
    RETURN total_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. RLS Policies pour sécuriser l'accès aux données d'audit

-- Activer RLS sur toutes les tables d'audit
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_retention_policies ENABLE ROW LEVEL SECURITY;

-- Policies pour audit_logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Policies pour gdpr_consents
CREATE POLICY "Users can manage their own consents" ON gdpr_consents
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all consents" ON gdpr_consents
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Policies pour gdpr_requests
CREATE POLICY "Users can manage their own GDPR requests" ON gdpr_requests
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all GDPR requests" ON gdpr_requests
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- Policies pour data_retention_policies (admin seulement)
CREATE POLICY "Only admins can manage retention policies" ON data_retention_policies
    FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
    );

-- 11. Vues pour faciliter les rapports de compliance

-- Vue pour les statistiques d'audit
CREATE OR REPLACE VIEW audit_statistics AS
SELECT 
    DATE_TRUNC('day', timestamp) as audit_date,
    action_type,
    resource_type,
    user_role,
    COUNT(*) as action_count,
    COUNT(DISTINCT user_id) as unique_users
FROM audit_logs
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', timestamp), action_type, resource_type, user_role
ORDER BY audit_date DESC;

-- Vue pour le statut des consentements GDPR
CREATE OR REPLACE VIEW gdpr_consent_status AS
SELECT 
    u.email,
    ur.role,
    gc.consent_type,
    gc.consent_given,
    gc.consent_date,
    gc.withdrawal_date,
    CASE 
        WHEN gc.withdrawal_date IS NOT NULL THEN 'withdrawn'
        WHEN gc.consent_given THEN 'active'
        ELSE 'not_given'
    END as status
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN gdpr_consents gc ON gc.user_id = u.id
ORDER BY u.email, gc.consent_type;

-- 12. Fonction pour générer un rapport de compliance
CREATE OR REPLACE FUNCTION generate_compliance_report(
    start_date DATE DEFAULT NOW() - INTERVAL '30 days',
    end_date DATE DEFAULT NOW()
) RETURNS JSONB AS $$
DECLARE
    report JSONB := '{}'::jsonb;
    audit_stats JSONB;
    gdpr_stats JSONB;
    retention_stats JSONB;
BEGIN
    -- Vérifier les permissions admin
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin') THEN
        RAISE EXCEPTION 'Accès non autorisé - Admin requis';
    END IF;
    
    -- Statistiques d'audit
    SELECT jsonb_build_object(
        'total_actions', COUNT(*),
        'unique_users', COUNT(DISTINCT user_id),
        'actions_by_type', jsonb_object_agg(action_type, type_count)
    ) INTO audit_stats
    FROM (
        SELECT action_type, COUNT(*) as type_count
        FROM audit_logs
        WHERE timestamp::date BETWEEN start_date AND end_date
        GROUP BY action_type
    ) sub
    CROSS JOIN (
        SELECT COUNT(*) as total, COUNT(DISTINCT user_id) as users
        FROM audit_logs
        WHERE timestamp::date BETWEEN start_date AND end_date
    ) totals;
    
    -- Statistiques GDPR
    SELECT jsonb_build_object(
        'active_consents', COUNT(*) FILTER (WHERE consent_given AND withdrawal_date IS NULL),
        'withdrawn_consents', COUNT(*) FILTER (WHERE withdrawal_date IS NOT NULL),
        'pending_requests', COUNT(*) FILTER (WHERE status = 'pending'),
        'completed_requests', COUNT(*) FILTER (WHERE status = 'completed')
    ) INTO gdpr_stats
    FROM gdpr_consents gc
    FULL OUTER JOIN gdpr_requests gr ON gc.user_id = gr.user_id;
    
    -- Construire le rapport final
    report := jsonb_build_object(
        'period', jsonb_build_object('start', start_date, 'end', end_date),
        'generated_at', NOW(),
        'generated_by', auth.uid(),
        'audit_trail', audit_stats,
        'gdpr_compliance', gdpr_stats
    );
    
    -- Logger la génération du rapport
    PERFORM create_audit_log(
        auth.uid(),
        'EXPORT',
        'compliance_report',
        NULL,
        NULL,
        report,
        '{"report_type": "compliance"}'::jsonb
    );
    
    RETURN report;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Tâche programmée pour le nettoyage automatique (à configurer via cron)
-- Cette fonction peut être appelée périodiquement pour maintenir la conformité

COMMENT ON TABLE audit_logs IS 'Table principale pour l''audit trail - traçabilité complète des actions utilisateurs';
COMMENT ON TABLE gdpr_consents IS 'Gestion des consentements GDPR par utilisateur et type';
COMMENT ON TABLE gdpr_requests IS 'Suivi des demandes de droits GDPR (accès, rectification, effacement, etc.)';
COMMENT ON TABLE data_retention_policies IS 'Politiques de rétention des données par table';

COMMENT ON FUNCTION create_audit_log IS 'Fonction utilitaire pour créer des entrées d''audit trail';
COMMENT ON FUNCTION export_user_data IS 'Export des données utilisateur pour le droit d''accès GDPR';
COMMENT ON FUNCTION delete_user_data IS 'Suppression/anonymisation des données pour le droit à l''effacement GDPR';
COMMENT ON FUNCTION cleanup_old_data IS 'Nettoyage automatique selon les politiques de rétention';
COMMENT ON FUNCTION generate_compliance_report IS 'Génération de rapports de compliance GDPR et audit';

-- Fin de la migration
SELECT 'Migration audit trail et GDPR terminée avec succès' as status;
