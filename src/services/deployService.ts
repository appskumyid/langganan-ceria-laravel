
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type DeployConfig = Tables<'deploy_configs'>;
type SSHKey = Tables<'ssh_keys'>;
type UserGeneratedFile = Tables<'user_generated_files'>;

export interface DeployResult {
  success: boolean;
  message: string;
  url?: string;
  pagesUrl?: string;
  deployedFiles?: string[];
  error?: string;
  timestamp?: string;
  commitSha?: string;
  deployPath?: string;
  uploadedFiles?: any[];
}

export class DeployService {
  static async deployToGitHub(
    config: DeployConfig, 
    files: UserGeneratedFile[], 
    sshKey: SSHKey
  ): Promise<DeployResult> {
    try {
      console.log('Starting GitHub deployment...', { 
        repository: config.github_repo, 
        filesCount: files.length 
      });

      if (!config.github_repo) {
        throw new Error('GitHub repository not specified in configuration');
      }

      // Prepare files for deployment
      const deployFiles = files.map(file => ({
        name: file.file_name,
        content: file.html_content || ''
      }));

      console.log('Files to deploy:', deployFiles.map(f => ({ name: f.name, size: f.content.length })));

      // Call Supabase Edge Function for GitHub deployment
      const { data, error } = await supabase.functions.invoke('deploy-to-github', {
        body: {
          repository: config.github_repo,
          files: deployFiles,
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

      console.log('GitHub deployment response:', data);

      return {
        success: true,
        message: data.message || `Successfully deployed to GitHub repository: ${config.github_repo}`,
        url: data.url,
        pagesUrl: data.pagesUrl,
        deployedFiles: data.deployedFiles,
        timestamp: data.timestamp,
        commitSha: data.commitSha
      };
    } catch (error: any) {
      console.error('GitHub deployment failed:', error);
      return {
        success: false,
        message: 'GitHub deployment failed',
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  static async deployToServer(
    config: DeployConfig, 
    files: UserGeneratedFile[], 
    sshKey: SSHKey
  ): Promise<DeployResult> {
    try {
      console.log('Starting server deployment...', { 
        serverIp: config.server_ip,
        username: config.server_username,
        filesCount: files.length 
      });

      if (!config.server_ip || !config.server_username) {
        throw new Error('Server IP and username must be specified in configuration');
      }

      // Prepare files for deployment
      const deployFiles = files.map(file => ({
        name: file.file_name,
        content: file.html_content || ''
      }));

      console.log('Files to deploy:', deployFiles.map(f => ({ name: f.name, size: f.content.length })));

      // Call Supabase Edge Function for server deployment
      const { data, error } = await supabase.functions.invoke('deploy-to-server', {
        body: {
          serverIp: config.server_ip,
          username: config.server_username,
          port: config.server_port || 22,
          deployPath: config.deploy_path || '/var/www/html',
          files: deployFiles,
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

      console.log('Server deployment response:', data);

      return {
        success: true,
        message: data.message || `Successfully deployed to server: ${config.server_ip}`,
        url: data.url,
        deployPath: data.deployPath,
        uploadedFiles: data.uploadedFiles,
        deployedFiles: data.deployedFiles,
        timestamp: data.timestamp
      };
    } catch (error: any) {
      console.error('Server deployment failed:', error);
      return {
        success: false,
        message: 'Server deployment failed',
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  static async deploy(
    config: DeployConfig, 
    files: UserGeneratedFile[]
  ): Promise<DeployResult> {
    try {
      console.log('Starting deployment process...', { 
        configType: config.type,
        configName: config.name,
        filesCount: files.length 
      });

      // Validate SSH key
      if (!config.ssh_key_id) {
        throw new Error('SSH key not selected in deployment configuration');
      }

      const { data: sshKey, error: sshKeyError } = await supabase
        .from('ssh_keys')
        .select('*')
        .eq('id', config.ssh_key_id)
        .single();

      if (sshKeyError || !sshKey) {
        console.error('SSH key fetch error:', sshKeyError);
        throw new Error('SSH key not found or access denied');
      }

      if (!files || files.length === 0) {
        throw new Error('No files available for deployment');
      }

      // Log files to be deployed
      console.log('Files to deploy:', files.map(f => ({ 
        name: f.file_name, 
        size: f.html_content?.length || 0 
      })));

      // Deploy based on configuration type
      if (config.type === 'github') {
        return await this.deployToGitHub(config, files, sshKey);
      } else if (config.type === 'server') {
        return await this.deployToServer(config, files, sshKey);
      } else {
        throw new Error(`Invalid deployment type: ${config.type}`);
      }
    } catch (error: any) {
      console.error('Deployment failed:', error);
      return {
        success: false,
        message: 'Deployment failed',
        error: error.message || 'Unknown error occurred'
      };
    }
  }
}
