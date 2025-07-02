
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
    const { serverIp, username, port, deployPath, files, sshKey, deployConfig }: DeployRequest = await req.json();

    console.log('Server deployment request received:', { 
      serverIp, 
      username, 
      port, 
      deployPath, 
      filesCount: files.length 
    });

    // Validate input
    if (!serverIp || !username || !files || files.length === 0) {
      throw new Error('Invalid deployment request: Missing required fields (serverIp, username, or files)');
    }

    // Validate SSH key
    if (!sshKey || !sshKey.private_key) {
      throw new Error('SSH private key is required for server deployment');
    }

    console.log('Starting server deployment with rsync...');
    console.log(`Target server: ${username}@${serverIp}:${port}`);
    console.log(`Deploy path: ${deployPath}`);
    console.log(`Files to deploy: ${files.map(f => f.name).join(', ')}`);

    // Create temporary directory for files
    const tempDir = await Deno.makeTempDir({ prefix: 'deploy_' });
    console.log(`Created temp directory: ${tempDir}`);

    try {
      // Write SSH private key to temporary file
      const sshKeyPath = `${tempDir}/ssh_key`;
      await Deno.writeTextFile(sshKeyPath, sshKey.private_key);
      await Deno.chmod(sshKeyPath, 0o600); // Set proper permissions for SSH key

      console.log('Step 1: Writing files to temporary directory...');
      const uploadedFiles = [];
      
      // Write all files to temp directory
      for (const file of files) {
        const filePath = `${tempDir}/${file.name}`;
        await Deno.writeTextFile(filePath, file.content);
        console.log(`Written: ${file.name} (${file.content.length} bytes)`);
        
        uploadedFiles.push({
          name: file.name,
          path: `${deployPath}/${file.name}`,
          size: file.content.length,
          uploaded: true
        });
      }

      console.log('Step 2: Testing SSH connection...');
      // Test SSH connection first
      const testSshCommand = new Deno.Command("ssh", {
        args: [
          "-i", sshKeyPath,
          "-p", port.toString(),
          "-o", "StrictHostKeyChecking=no",
          "-o", "ConnectTimeout=10",
          `${username}@${serverIp}`,
          "echo 'SSH connection successful'"
        ],
        stdout: "piped",
        stderr: "piped"
      });

      const testSshResult = await testSshCommand.output();
      
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
          "-p", port.toString(),
          "-o", "StrictHostKeyChecking=no",
          `${username}@${serverIp}`,
          `mkdir -p ${deployPath}`
        ],
        stdout: "piped",
        stderr: "piped"
      });

      const mkdirResult = await mkdirCommand.output();
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
          "-e", `ssh -i ${sshKeyPath} -p ${port} -o StrictHostKeyChecking=no`,
          `${tempDir}/`,
          `${username}@${serverIp}:${deployPath}/`
        ],
        stdout: "piped",
        stderr: "piped"
      });

      const rsyncResult = await rsyncCommand.output();
      
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
          "-p", port.toString(),
          "-o", "StrictHostKeyChecking=no",
          `${username}@${serverIp}`,
          `find ${deployPath} -type f -name "*.html" -exec chmod 644 {} \\; && find ${deployPath} -type f -name "*.js" -exec chmod 644 {} \\; && find ${deployPath} -type f -name "*.css" -exec chmod 644 {} \\; && find ${deployPath} -type f -name "*.json" -exec chmod 644 {} \\;`
        ],
        stdout: "piped",
        stderr: "piped"
      });

      await chmodCommand.output(); // Don't fail if chmod fails

      console.log('Server deployment completed successfully');

      const serverUrl = `http://${serverIp}`;
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully deployed ${files.length} files to server ${serverIp}`,
          url: serverUrl,
          deployPath: deployPath,
          uploadedFiles: uploadedFiles,
          deployedFiles: files.map(f => f.name),
          timestamp: new Date().toISOString(),
          deploymentMethod: "rsync",
          note: `Files have been deployed to ${serverUrl} at path ${deployPath} using rsync over SSH`
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
      try {
        await Deno.remove(tempDir, { recursive: true });
        console.log('Cleaned up temporary directory');
      } catch (error) {
        console.error('Failed to clean up temp directory:', error);
      }
    }

  } catch (error) {
    console.error('Server deployment error:', error);
    
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
            "rsync not installed on server"
          ],
          requirements: [
            "SSH access to the target server",
            "rsync installed on both source and target",
            "Proper SSH key authentication setup",
            "Correct server firewall configuration"
          ]
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
