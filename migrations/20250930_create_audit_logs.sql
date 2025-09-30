-- Migration: Create audit_logs table for GDPR compliance and activity tracking
-- Date: 2025-09-30
-- Description: Table pour tracer toutes les actions sensibles (conformité GDPR/audit trail)

-- ============================================================================
-- UP Migration
-- ============================================================================

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Actor information
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role TEXT,
    actor_email TEXT,
    
    -- Action details
    entity TEXT NOT NULL,  -- e.g., 'mission', 'user', 'invoice', 'notification'
    entity_id UUID,
    action TEXT NOT NULL,  -- e.g., 'create', 'update', 'delete', 'view', 'export'
    
    -- Context and metadata
    context JSONB DEFAULT '{}'::jsonb,  -- IP address, user agent, additional metadata
    
    -- Performance tracking
    duration_ms INTEGER,  -- Optional: time taken for the action
    
    -- Status
    success BOOLEAN DEFAULT true,
    error_message TEXT
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id) WHERE entity_id IS NOT NULL;

-- Add comment
COMMENT ON TABLE public.audit_logs IS 'Table de traçabilité pour conformité GDPR et audit des actions sensibles';

-- ============================================================================
-- RLS (Row Level Security) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read audit logs
CREATE POLICY "admin_read_audit_logs" ON public.audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Policy: Service role can insert (for backend/Edge Functions)
CREATE POLICY "service_insert_audit_logs" ON public.audit_logs
    FOR INSERT
    WITH CHECK (true);  -- Service role bypasses RLS anyway

-- Policy: No one can update or delete audit logs (immutable)
-- Audit logs should be write-once, read-many for compliance

-- ============================================================================
-- Helper function: Log an action
-- ============================================================================

CREATE OR REPLACE FUNCTION public.log_audit_action(
    p_actor_id UUID,
    p_actor_role TEXT,
    p_entity TEXT,
    p_entity_id UUID,
    p_action TEXT,
    p_context JSONB DEFAULT '{}'::jsonb,
    p_success BOOLEAN DEFAULT true,
    p_error_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (
        actor_id,
        actor_role,
        entity,
        entity_id,
        action,
        context,
        success,
        error_message
    )
    VALUES (
        p_actor_id,
        p_actor_role,
        p_entity,
        p_entity_id,
        p_action,
        p_context,
        p_success,
        p_error_message
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Grant execute to authenticated users (will be called by service role)
GRANT EXECUTE ON FUNCTION public.log_audit_action TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_action TO service_role;

-- ============================================================================
-- Sample triggers for automatic audit logging (optional)
-- ============================================================================

-- Example: Auto-log mission deletions
CREATE OR REPLACE FUNCTION public.trigger_audit_mission_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.audit_logs (
        actor_id,
        entity,
        entity_id,
        action,
        context
    )
    VALUES (
        auth.uid(),
        'mission',
        OLD.id,
        'delete',
        jsonb_build_object(
            'mission_title', OLD.title,
            'mission_status', OLD.status,
            'deleted_at', NOW()
        )
    );
    
    RETURN OLD;
END;
$$;

-- Note: Apply trigger to missions table if desired
-- CREATE TRIGGER audit_mission_delete
--     BEFORE DELETE ON public.missions
--     FOR EACH ROW
--     EXECUTE FUNCTION public.trigger_audit_mission_delete();

-- ============================================================================
-- DOWN Migration (Rollback)
-- ============================================================================

-- DROP TRIGGER IF EXISTS audit_mission_delete ON public.missions;
-- DROP FUNCTION IF EXISTS public.trigger_audit_mission_delete();
-- DROP FUNCTION IF EXISTS public.log_audit_action(UUID, TEXT, TEXT, UUID, TEXT, JSONB, BOOLEAN, TEXT);
-- DROP POLICY IF EXISTS "service_insert_audit_logs" ON public.audit_logs;
-- DROP POLICY IF EXISTS "admin_read_audit_logs" ON public.audit_logs;
-- DROP TABLE IF EXISTS public.audit_logs CASCADE;

-- Note: Uncomment the above section to rollback this migration
