
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DeployRequest {
  serverIp: string;
  username: string;
  port: number;
  deployPath: string;
  files: Array<{
    name: string;
    content: string;
  }>;
  sshKey: {
    private_key: string;
    public_key: string;
  };
  deployConfig: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    console.log('=== Server Deployment Started ===');
    
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      console.error('Failed to parse request body:', error);
      throw new Error('Invalid JSON in request body');
    }

    const { serverIp, username, port, deployPath, files, sshKey, deployConfig }: DeployRequest = requestBody;

    console.log('Deployment request received:', { 
      serverIp, 
      username, 
      port: port || 22, 
      deployPath: deployPath || '/var/www/html',
      filesCount: files?.length || 0 
    });

    // Validate input
    if (!serverIp || !username || !files || files.length === 0) {
      console.error('Validation failed:', { serverIp: !!serverIp, username: !!username, filesCount: files?.length });
      throw new Error('Invalid deployment request: Missing required fields (serverIp, username, or files)');
    }

    // Validate SSH key
    if (!sshKey || !sshKey.private_key) {
      console.error('SSH key validation failed');
      throw new Error('SSH private key is required for server deployment');
    }

    const actualPort = port || 22;
    const actualDeployPath = deployPath || '/var/www/html';

    console.log('=== Starting Server Deployment ===');
    console.log(`Target: ${username}@${serverIp}:${actualPort}`);
    console.log(`Deploy path: ${actualDeployPath}`);
    console.log(`Files to deploy: ${files.map(f => f.name).join(', ')}`);

    // Create temporary directory for files
    let tempDir;
    try {
      tempDir = await Deno.makeTempDir({ prefix: 'deploy_' });
      console.log(`Created temp directory: ${tempDir}`);
    } catch (error) {
      console.error('Failed to create temp directory:', error);
      throw new Error('Failed to create temporary directory');
    }

    try {
      // Write SSH private key to temporary file
      const sshKeyPath = `${tempDir}/ssh_key`;
      
      try {
        await Deno.writeTextFile(sshKeyPath, sshKey.private_key);
        await Deno.chmod(sshKeyPath, 0o600);
        console.log('SSH key written and permissions set');
      } catch (error) {
        console.error('Failed to write SSH key:', error);
        throw new Error('Failed to prepare SSH key');
      }

      console.log('Step 1: Writing files to temporary directory...');
      const uploadedFiles = [];
      
      // Write all files to temp directory
      for (const file of files) {
        try {
          const filePath = `${tempDir}/${file.name}`;
          await Deno.writeTextFile(filePath, file.content);
          console.log(`Written: ${file.name} (${file.content.length} bytes)`);
          
          uploadedFiles.push({
            name: file.name,
            path: `${actualDeployPath}/${file.name}`,
            size: file.content.length,
            uploaded: true
          });
        } catch (error) {
          console.error(`Failed to write file ${file.name}:`, error);
          throw new Error(`Failed to write file: ${file.name}`);
        }
      }

      console.log('Step 2: Testing SSH connection...');
      
      // Test SSH connection first
      const testSshCommand = new Deno.Command("ssh", {
        args: [
          "-i", sshKeyPath,
          "-p", actualPort.toString(),
          "-o", "StrictHostKeyChecking=no",
          "-o", "ConnectTimeout=10",
          "-o", "BatchMode=yes",
          `${username}@${serverIp}`,
          "echo 'SSH connection successful'"
        ],
        stdout: "piped",
        stderr: "piped"
      });

      let testSshResult;
      try {
        testSshResult = await testSshCommand.output();
      } catch (error) {
        console.error('SSH command execution failed:', error);
        throw new Error('Failed to execute SSH command - SSH may not be available in this environment');
      }
      
      if (!testSshResult.success) {
        const errorOutput = new TextDecoder().decode(testSshResult.stderr);
        console.error('SSH connection test failed:', errorOutput);
        throw new Error(`SSH connection failed: ${errorOutput}`);
      }

      console.log('SSH connection test successful');

      console.log('Step 3: Creating deployment directory on server...');
      
      // Create deployment directory
      const mkdirCommand = new Deno.Command("ssh", {
        args: [
          "-i", sshKeyPath,
          "-p", actualPort.toString(),
          "-o", "StrictHostKeyChecking=no",
          "-o", "BatchMode=yes",
          `${username}@${serverIp}`,
          `mkdir -p ${actualDeployPath}`
        ],
        stdout: "piped",
        stderr: "piped"
      });

      let mkdirResult;
      try {
        mkdirResult = await mkdirCommand.output();
      } catch (error) {
        console.error('Directory creation command failed:', error);
        throw new Error('Failed to create directory on server');
      }
      
      if (!mkdirResult.success) {
        const errorOutput = new TextDecoder().decode(mkdirResult.stderr);
        console.error('Failed to create directory:', errorOutput);
        throw new Error(`Failed to create directory: ${errorOutput}`);
      }

      console.log('Step 4: Deploying files with rsync...');
      
      // Use rsync to deploy files
      const rsyncCommand = new Deno.Command("rsync", {
        args: [
          "-avz", // archive, verbose, compress
          "--delete", // delete files on destination that don't exist in source
          "-e", `ssh -i ${sshKeyPath} -p ${actualPort} -o StrictHostKeyChecking=no -o BatchMode=yes`,
          `${tempDir}/`,
          `${username}@${serverIp}:${actualDeployPath}/`
        ],
        stdout: "piped",
        stderr: "piped"
      });

      let rsyncResult;
      try {
        rsyncResult = await rsyncCommand.output();
      } catch (error) {
        console.error('Rsync command execution failed:', error);
        throw new Error('Failed to execute rsync - rsync may not be available in this environment');
      }
      
      if (!rsyncResult.success) {
        const errorOutput = new TextDecoder().decode(rsyncResult.stderr);
        console.error('Rsync deployment failed:', errorOutput);
        throw new Error(`Rsync deployment failed: ${errorOutput}`);
      }

      const rsyncOutput = new TextDecoder().decode(rsyncResult.stdout);
      console.log('Rsync output:', rsyncOutput);

      console.log('Step 5: Setting file permissions...');
      
      // Set proper file permissions
      const chmodCommand = new Deno.Command("ssh", {
        args: [
          "-i", sshKeyPath,
          "-p", actualPort.toString(),
          "-o", "StrictHostKeyChecking=no",
          "-o", "BatchMode=yes",
          `${username}@${serverIp}`,
          `find ${actualDeployPath} -type f -name "*.html" -exec chmod 644 {} \\; && find ${actualDeployPath} -type f -name "*.js" -exec chmod 644 {} \\; && find ${actualDeployPath} -type f -name "*.css" -exec chmod 644 {} \\; && find ${actualDeployPath} -type f -name "*.json" -exec chmod 644 {} \\;`
        ],
        stdout: "piped",
        stderr: "piped"
      });

      try {
        await chmodCommand.output(); // Don't fail if chmod fails
        console.log('File permissions set');
      } catch (error) {
        console.warn('File permission setting failed (non-critical):', error);
      }

      console.log('=== Server deployment completed successfully ===');

      const serverUrl = `http://${serverIp}`;
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully deployed ${files.length} files to server ${serverIp}`,
          url: serverUrl,
          deployPath: actualDeployPath,
          uploadedFiles: uploadedFiles,
          deployedFiles: files.map(f => f.name),
          timestamp: new Date().toISOString(),
          deploymentMethod: "rsync",
          note: `Files have been deployed to ${serverUrl} at path ${actualDeployPath} using rsync over SSH`
        }),
        {
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
          status: 200,
        }
      );

    } finally {
      // Clean up temporary directory
      if (tempDir) {
        try {
          await Deno.remove(tempDir, { recursive: true });
          console.log('Cleaned up temporary directory');
        } catch (error) {
          console.error('Failed to clean up temp directory:', error);
        }
      }
    }

  } catch (error) {
    console.error('=== Server deployment error ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown server deployment error',
        timestamp: new Date().toISOString(),
        troubleshooting: {
          common_issues: [
            "SSH key format or permissions issue",
            "Server IP, port, or username incorrect", 
            "Network connectivity issues",
            "Server firewall blocking SSH connections",
            "Deploy path permissions issue",
            "rsync or ssh commands not available in Deno environment",
            "SSH key authentication setup incorrect"
          ],
          requirements: [
            "SSH access to the target server",
            "rsync installed on both source and target",
            "Proper SSH key authentication setup",
            "Correct server firewall configuration",
            "SSH and rsync commands available in Deno runtime"
          ],
          note: "If SSH/rsync are not available in this Deno environment, consider using alternative deployment methods like FTP, SFTP, or HTTP-based deployment APIs."
        }
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 500,
      }
    );
  }
})
