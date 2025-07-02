
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DeployRequest {
  repository: string;
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
  console.log('=== GitHub Deploy Function Started ===');
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

    const { repository, files, sshKey, deployConfig }: DeployRequest = requestBody;

    console.log('GitHub deployment request received:', { 
      repository, 
      filesCount: files?.length || 0,
      hasSSHKey: !!sshKey,
      hasDeployConfig: !!deployConfig
    });

    // Validate input
    if (!repository || !files || files.length === 0) {
      console.error('Validation failed:', { 
        hasRepository: !!repository, 
        hasFiles: !!files, 
        filesCount: files?.length || 0 
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid deployment request: Missing repository or files',
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

    // Parse repository format
    let owner, repo;
    try {
      // Handle both formats: username/repo or git@github.com:username/repo.git
      if (repository.startsWith('git@github.com:')) {
        const gitRepo = repository.replace('git@github.com:', '').replace('.git', '');
        [owner, repo] = gitRepo.split('/');
      } else {
        [owner, repo] = repository.split('/');
      }

      if (!owner || !repo) {
        throw new Error('Invalid repository format');
      }
    } catch (error) {
      console.error('Repository parsing error:', error);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Repository should be in format: username/repository-name or git@github.com:username/repository-name.git',
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

    // Get GitHub token from environment
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      console.error('GitHub token not found in environment variables');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'GitHub token not configured. Please add GITHUB_TOKEN to your Supabase project secrets.',
          timestamp: new Date().toISOString()
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

    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
    console.log('Starting GitHub deployment...');
    console.log(`Target repository: ${owner}/${repo}`);
    console.log(`Base URL: ${baseUrl}`);
    console.log(`Files to deploy: ${files.map(f => f.name).join(', ')}`);
    
    // Check if repository exists and is accessible
    console.log('Step 1: Checking repository access...');
    const repoResponse = await fetch(`${baseUrl}`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Supabase-Edge-Function',
      },
    });

    console.log(`Repository check response status: ${repoResponse.status}`);

    if (!repoResponse.ok) {
      const errorBody = await repoResponse.text();
      console.error('Repository access error:', errorBody);
      
      let errorMessage;
      if (repoResponse.status === 404) {
        errorMessage = `Repository ${owner}/${repo} not found or access denied. Please ensure the repository exists and your GitHub token has the necessary permissions.`;
      } else if (repoResponse.status === 401) {
        errorMessage = 'GitHub authentication failed. Please check your GITHUB_TOKEN.';
      } else {
        errorMessage = `Failed to access repository: ${repoResponse.status} ${repoResponse.statusText}`;
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          timestamp: new Date().toISOString()
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

    console.log('Step 2: Getting repository default branch...');
    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch || 'main';
    console.log(`Default branch: ${defaultBranch}`);

    // Get the latest commit SHA for the default branch
    console.log('Step 3: Getting latest commit...');
    const branchResponse = await fetch(`${baseUrl}/branches/${defaultBranch}`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Supabase-Edge-Function',
      },
    });

    if (!branchResponse.ok) {
      const errorBody = await branchResponse.text();
      console.error('Branch access error:', errorBody);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to get branch info: ${branchResponse.status} ${branchResponse.statusText}`,
          timestamp: new Date().toISOString()
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

    const branchData = await branchResponse.json();
    const latestCommitSha = branchData.commit.sha;
    console.log(`Latest commit SHA: ${latestCommitSha}`);

    console.log('Step 4: Creating tree with files...');
    // Create tree with all files
    const tree = [];
    
    for (const file of files) {
      console.log(`Processing: ${file.name} (${file.content.length} bytes)`);
      
      // Create blob for each file
      const blobResponse = await fetch(`${baseUrl}/git/blobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function',
        },
        body: JSON.stringify({
          content: btoa(unescape(encodeURIComponent(file.content))), // Base64 encode
          encoding: 'base64',
        }),
      });

      if (!blobResponse.ok) {
        const errorBody = await blobResponse.text();
        console.error(`Blob creation error for ${file.name}:`, errorBody);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to create blob for ${file.name}: ${blobResponse.status} ${blobResponse.statusText}`,
            timestamp: new Date().toISOString()
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

      const blobData = await blobResponse.json();
      console.log(`Created blob for ${file.name}: ${blobData.sha}`);
      
      tree.push({
        path: file.name,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // Create new tree
    console.log('Step 5: Creating new tree...');
    const treeResponse = await fetch(`${baseUrl}/git/trees`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function',
      },
      body: JSON.stringify({
        base_tree: latestCommitSha,
        tree: tree,
      }),
    });

    if (!treeResponse.ok) {
      const errorBody = await treeResponse.text();
      console.error('Tree creation error:', errorBody);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create tree: ${treeResponse.status} ${treeResponse.statusText}`,
          timestamp: new Date().toISOString()
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

    const treeData = await treeResponse.json();
    console.log(`Created tree: ${treeData.sha}`);

    console.log('Step 6: Creating commit...');
    // Create commit
    const commitResponse = await fetch(`${baseUrl}/git/commits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function',
      },
      body: JSON.stringify({
        message: `Deploy website files - ${new Date().toISOString()}`,
        tree: treeData.sha,
        parents: [latestCommitSha],
      }),
    });

    if (!commitResponse.ok) {
      const errorBody = await commitResponse.text();
      console.error('Commit creation error:', errorBody);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to create commit: ${commitResponse.status} ${commitResponse.statusText}`,
          timestamp: new Date().toISOString()
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

    const commitData = await commitResponse.json();
    console.log(`Created commit: ${commitData.sha}`);

    console.log('Step 7: Updating branch reference...');
    // Update branch reference
    const refResponse = await fetch(`${baseUrl}/git/refs/heads/${defaultBranch}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Supabase-Edge-Function',
      },
      body: JSON.stringify({
        sha: commitData.sha,
      }),
    });

    if (!refResponse.ok) {
      const errorBody = await refResponse.text();
      console.error('Reference update error:', errorBody);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to update branch: ${refResponse.status} ${refResponse.statusText}`,
          timestamp: new Date().toISOString()
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

    console.log('GitHub deployment completed successfully');

    const githubUrl = `https://github.com/${owner}/${repo}`;
    const pagesUrl = `https://${owner}.github.io/${repo}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully deployed ${files.length} files to GitHub repository: ${owner}/${repo}`,
        url: githubUrl,
        pagesUrl: pagesUrl,
        deployedFiles: files.map(f => f.name),
        timestamp: new Date().toISOString(),
        commitSha: commitData.sha,
        note: `Files have been committed to the ${defaultBranch} branch. If GitHub Pages is enabled, your site will be available at: ${pagesUrl}`
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        },
        status: 200,
      }
    );

  } catch (error) {
    console.error('=== GitHub deployment error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown GitHub deployment error',
        timestamp: new Date().toISOString(),
        troubleshooting: {
          steps: [
            "1. Ensure GITHUB_TOKEN is set in Supabase project secrets",
            "2. Verify the repository exists and is accessible",
            "3. Check that the token has 'repo' permissions",
            "4. Confirm the repository format is 'username/repository-name'"
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
