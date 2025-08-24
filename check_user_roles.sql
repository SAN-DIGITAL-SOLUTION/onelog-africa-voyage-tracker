-- Vérifier si la table user_roles existe et afficher sa structure
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public' 
    AND table_name = 'user_roles'
ORDER BY 
    ordinal_position;

-- Vérifier si le type app_role existe
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM 
    pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE 
    t.typname = 'app_role';
