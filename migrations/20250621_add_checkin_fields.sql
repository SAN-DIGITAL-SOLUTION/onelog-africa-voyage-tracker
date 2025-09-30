-- fichier : migrations/20250621_add_checkin_fields.sql
ALTER TABLE missions
ADD COLUMN checked_in boolean DEFAULT false,
ADD COLUMN check_in_time timestamp with time zone,
ADD COLUMN checked_out boolean DEFAULT false,
ADD COLUMN check_out_time timestamp with time zone;
