
-- Create table for SSH keys management
CREATE TABLE ssh_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  private_key text NOT NULL,
  public_key text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for deploy configurations
CREATE TABLE deploy_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('github', 'server')),
  github_repo text,
  server_ip text,
  server_username text,
  server_port integer DEFAULT 22,
  deploy_path text,
  ssh_key_id uuid REFERENCES ssh_keys(id),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE ssh_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE deploy_configs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for admins)
CREATE POLICY "Allow all operations for authenticated users" ON ssh_keys
  FOR ALL USING (true);

CREATE POLICY "Allow all operations for authenticated users" ON deploy_configs
  FOR ALL USING (true);
