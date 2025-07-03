-- Add internal_server as a new deployment type
ALTER TYPE deployment_type ADD VALUE IF NOT EXISTS 'internal_server';

-- Update deploy_configs table to support internal server paths
ALTER TABLE deploy_configs 
ADD COLUMN IF NOT EXISTS internal_path TEXT;