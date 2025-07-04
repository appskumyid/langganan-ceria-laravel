-- First, let's see what check constraint exists
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'deploy_configs'::regclass 
AND contype = 'c';

-- Drop the existing check constraint
ALTER TABLE deploy_configs DROP CONSTRAINT IF EXISTS deploy_configs_type_check;

-- Add new check constraint that includes internal_server
ALTER TABLE deploy_configs 
ADD CONSTRAINT deploy_configs_type_check 
CHECK (type IN ('github', 'server', 'internal_server'));