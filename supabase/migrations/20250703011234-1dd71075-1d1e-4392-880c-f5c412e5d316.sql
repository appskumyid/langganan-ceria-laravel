-- Update deploy_configs table to support internal server paths
ALTER TABLE deploy_configs 
ADD COLUMN IF NOT EXISTS internal_path TEXT;