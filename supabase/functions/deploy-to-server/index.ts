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
  console.log('=== Server Deploy Function Started ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    console.log('=== Parsing Request Body ===');
    
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Raw body length:', bodyText.length);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Request body is empty');
      }
      
      requestBody = JSON.parse(bodyText);
      console.log('Parsed request body keys:', Object.keys(requestBody));
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid JSON in request body: ${parseError.message}`,
          timestamp: new Date().toISOString()
        }),
        {
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
          status: 400,
        }
      );
    }

    const { serverIp, username, port, deployPath, files, sshKey, deployConfig }: DeployRequest = requestBody;

    console.log('Server deployment request received:', { 
      serverIp, 
      username, 
      port, 
      deployPath, 
      filesCount: files?.length || 0,
      hasSSHKey: !!sshKey,
      hasDeployConfig: !!deployConfig
    });

    // Validate input
    if (!serverIp || !username || !port || !deployPath || !files || files.length === 0 || !sshKey) {
      console.error('Validation failed:', { 
        hasServerIp: !!serverIp, 
        hasUsername: !!username, 
        hasPort: !!port, 
        hasDeployPath: !!deployPath, 
        hasFiles: !!files, 
        filesCount: files?.length || 0,
        hasSSHKey: !!sshKey
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid deployment request: Missing required fields (serverIp, username, port, deployPath, files, or sshKey)',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { 
            "Content-Type": "application/json",
            ...corsHeaders
          },
          status: 400,
        }
      );
    }

    console.log('=== Server deployment limitation ===');
    console.log('Note: SSH/rsync deployment is not available in Deno Deploy/Edge Functions environment');
    
    // Since SSH and rsync commands are not available in Deno Deploy environment,
    // we'll return helpful information instead of attempting the deployment
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Server deployment via SSH/rsync is not supported in this serverless environment',
        message: 'Direct SSH deployment is not available in Deno Deploy environment',
        timestamp: new Date().toISOString(),
        receivedData: {
          serverIp: serverIp,
          username: username,
          port: port,
          deployPath: deployPath,
          fileCount: files.length,
          fileNames: files.map(f => f.name)
        },
        alternatives: {
          recommended: [
            'Use GitHub Actions for automated deployment',
            'Deploy via FTP/SFTP manually',
            'Use a CI/CD pipeline with server access',
            'Deploy via container registry'
          ],
          github_actions: {
            description: 'Set up GitHub Actions workflow for automated deployment',
            example_workflow: `
name: Deploy to Server
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.7
      with:
        host: ${serverIp}
        username: ${username}
        port: ${port}
        key: \${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd ${deployPath}
          git pull origin main
          # Add your deployment commands here
            `.trim()
          },
          manual_deployment: {
            description: 'Manual deployment options',
            steps: [
              '1. Use FileZilla or similar FTP/SFTP client',
              '2. Connect to your server using SSH credentials',
              '3. Upload files to the deployment path',
              '4. Set proper file permissions if needed'
            ]
          }
        },
        note: 'For automated deployment, consider setting up GitHub repository and using GitHub Actions'
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 422, // Unprocessable Entity - request is valid but cannot be processed
      }
    );

  } catch (error) {
    console.error('=== Server deployment error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown server deployment error',
        timestamp: new Date().toISOString(),
        troubleshooting: {
          environment: 'Deno Deploy/Edge Functions',
          limitation: 'SSH and rsync commands are not available in serverless environment',
          recommendation: 'Use GitHub Actions or manual deployment methods'
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