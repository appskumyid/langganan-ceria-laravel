
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type DeployConfig = Tables<'deploy_configs'>;
type SSHKey = Tables<'ssh_keys'>;
type UserGeneratedFile = Tables<'user_generated_files'>;

export interface DeployResult {
  success: boolean;
  message: string;
  url?: string;
  error?: string;
}

export class DeployService {
  static async deployToGitHub(
    config: DeployConfig, 
    files: UserGeneratedFile[], 
    sshKey: SSHKey
  ): Promise<DeployResult> {
    try {
      console.log('Starting GitHub deployment...', { config, filesCount: files.length });

      if (!config.github_repo) {
        throw new Error('GitHub repository not specified');
      }

      // Call Supabase Edge Function for GitHub deployment
      const { data, error } = await supabase.functions.invoke('deploy-to-github', {
        body: {
          repository: config.github_repo,
          files: files.map(file => ({
            name: file.file_name,
            content: file.html_content || ''
          })),
          sshKey: {
            private_key: sshKey.private_key,
            public_key: sshKey.public_key
          },
          deployConfig: config
        }
      });

      if (error) {
        console.error('GitHub deployment error:', error);
        throw new Error(error.message || 'GitHub deployment failed');
      }

      return {
        success: true,
        message: `Successfully deployed to GitHub repository: ${config.github_repo}`,
        url: `https://github.com/${config.github_repo}`
      };
    } catch (error: any) {
      console.error('GitHub deployment failed:', error);
      return {
        success: false,
        message: 'GitHub deployment failed',
        error: error.message
      };
    }
  }

  static async deployToServer(
    config: DeployConfig, 
    files: UserGeneratedFile[], 
    sshKey: SSHKey
  ): Promise<DeployResult> {
    try {
      console.log('Starting server deployment...', { config, filesCount: files.length });

      if (!config.server_ip || !config.server_username) {
        throw new Error('Server IP or username not specified');
      }

      // Call Supabase Edge Function for server deployment
      const { data, error } = await supabase.functions.invoke('deploy-to-server', {
        body: {
          serverIp: config.server_ip,
          username: config.server_username,
          port: config.server_port || 22,
          deployPath: config.deploy_path || '/var/www/html',
          files: files.map(file => ({
            name: file.file_name,
            content: file.html_content || ''
          })),
          sshKey: {
            private_key: sshKey.private_key,
            public_key: sshKey.public_key
          },
          deployConfig: config
        }
      });

      if (error) {
        console.error('Server deployment error:', error);
        throw new Error(error.message || 'Server deployment failed');
      }

      return {
        success: true,
        message: `Successfully deployed to server: ${config.server_ip}`,
        url: `http://${config.server_ip}`
      };
    } catch (error: any) {
      console.error('Server deployment failed:', error);
      return {
        success: false,
        message: 'Server deployment failed',
        error: error.message
      };
    }
  }

  static async deploy(
    config: DeployConfig, 
    files: UserGeneratedFile[]
  ): Promise<DeployResult> {
    try {
      console.log('Starting deployment process...', { configType: config.type });

      // Get SSH key
      if (!config.ssh_key_id) {
        throw new Error('SSH key not selected');
      }

      const { data: sshKey, error: sshKeyError } = await supabase
        .from('ssh_keys')
        .select('*')
        .eq('id', config.ssh_key_id)
        .single();

      if (sshKeyError || !sshKey) {
        throw new Error('SSH key not found');
      }

      if (files.length === 0) {
        throw new Error('No files to deploy');
      }

      // Deploy based on type
      if (config.type === 'github') {
        return await this.deployToGitHub(config, files, sshKey);
      } else if (config.type === 'server') {
        return await this.deployToServer(config, files, sshKey);
      } else {
        throw new Error('Invalid deployment type');
      }
    } catch (error: any) {
      console.error('Deployment failed:', error);
      return {
        success: false,
        message: 'Deployment failed',
        error: error.message
      };
    }
  }
}
