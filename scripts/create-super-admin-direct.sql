-- =======================================
-- CRÉATION DIRECTE SUPER ADMIN OneLog Africa
-- Contourne le formulaire d'inscription
-- =======================================

-- 1. Créer l'utilisateur directement dans auth.users si nécessaire
DO $$
DECLARE
    user_exists BOOLEAN;
    user_uuid UUID;
BEGIN
    -- Vérifier si l'utilisateur existe déjà
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'san@sandigitalsolutions.com'
    ) INTO user_exists;
    
    IF NOT user_exists THEN
        -- Créer l'utilisateur dans auth.users
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            invited_at,
            confirmation_token,
            confirmation_sent_at,
            recovery_token,
            recovery_sent_at,
            email_change_token_new,
            email_change,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'san@sandigitalsolutions.com',
            crypt('SuperAdmin2024!', gen_salt('bf')), -- Mot de passe temporaire
            NOW(),
            NOW(),
            '',
            NOW(),
            '',
            NULL,
            '',
            '',
            NULL,
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"role": "super_admin", "fullname": "Super Admin", "phone": "+225000000000", "onboarding_complete": true}',
            false,
            NOW(),
            NOW(),
            '+225000000000',
            NOW(),
            '',
            '',
            NULL,
            '',
            0,
            NULL,
            '',
            NULL
        )
        RETURNING id INTO user_uuid;
        
        RAISE NOTICE 'Utilisateur super admin créé avec l''ID: %', user_uuid;
    ELSE
        -- Récupérer l'ID de l'utilisateur existant
        SELECT id INTO user_uuid FROM auth.users WHERE email = 'san@sandigitalsolutions.com';
        RAISE NOTICE 'Utilisateur existant trouvé avec l''ID: %', user_uuid;
    END IF;
    
    -- 2. Créer le profil dans la table profiles si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        INSERT INTO public.profiles (id, fullname, phone, created_at, updated_at)
        VALUES (user_uuid, 'Super Admin', '+225000000000', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            fullname = 'Super Admin',
            phone = '+225000000000',
            updated_at = NOW();
        
        RAISE NOTICE 'Profil créé/mis à jour pour le super admin';
    END IF;
    
    -- 3. Créer le profil dans la table users si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        INSERT INTO public.users (id, fullname, phone, created_at, updated_at)
        VALUES (user_uuid, 'Super Admin', '+225000000000', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
            fullname = 'Super Admin',
            phone = '+225000000000',
            updated_at = NOW();
        
        RAISE NOTICE 'Utilisateur créé/mis à jour dans la table users';
    END IF;
    
    -- 4. Assigner le rôle super_admin
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
        -- Récupérer l'ID du rôle super_admin
        DECLARE
            super_admin_role_id INTEGER;
        BEGIN
            SELECT id INTO super_admin_role_id FROM public.roles WHERE name = 'super_admin';
            
            IF super_admin_role_id IS NOT NULL THEN
                INSERT INTO public.user_roles (user_id, role_id, role_status, created_at, updated_at)
                VALUES (user_uuid, super_admin_role_id, 'approved', NOW(), NOW())
                ON CONFLICT (user_id) DO UPDATE SET
                    role_id = super_admin_role_id,
                    role_status = 'approved',
                    updated_at = NOW();
                
                RAISE NOTICE 'Rôle super_admin assigné avec l''ID: %', super_admin_role_id;
            ELSE
                RAISE NOTICE 'Rôle super_admin non trouvé dans la table roles';
            END IF;
        END;
    END IF;
    
    -- 5. Mettre à jour les métadonnées utilisateur
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_build_object(
        'role', 'super_admin',
        'fullname', 'Super Admin',
        'phone', '+225000000000',
        'onboarding_complete', true
    ),
    updated_at = NOW()
    WHERE id = user_uuid;
    
    RAISE NOTICE 'Métadonnées utilisateur mises à jour';
    
    -- 6. Afficher les informations de connexion
    RAISE NOTICE '=== SUPER ADMIN CRÉÉ AVEC SUCCÈS ===';
    RAISE NOTICE 'Email: san@sandigitalsolutions.com';
    RAISE NOTICE 'Mot de passe temporaire: SuperAdmin2024!';
    RAISE NOTICE 'UUID: %', user_uuid;
    RAISE NOTICE 'Statut: Actif et prêt à se connecter';
    RAISE NOTICE '=====================================';
    
END $$;
