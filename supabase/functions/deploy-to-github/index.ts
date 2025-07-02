
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  try {
    const { repository, files, sshKey, deployConfig }: DeployRequest = await req.json();

    console.log('GitHub deployment request received:', { 
      repository, 
      filesCount: files.length 
    });

    // Validate input
    if (!repository || !files || files.length === 0) {
      throw new Error('Invalid deployment request: Missing repository or files');
    }

    // Validate repository format (should be username/repo-name)
    if (!repository.includes('/') || repository.split('/').length !== 2) {
      throw new Error('Repository should be in format: username/repository-name');
    }

    // Get GitHub token from environment
    const githubToken = Deno.env.get('GITHUB_TOKEN');
    if (!githubToken) {
      throw new Error('GitHub token not configured. Please add GITHUB_TOKEN to your Supabase secrets.');
    }

    const [owner, repo] = repository.split('/');
    const baseUrl = `https://api.github.com/repos/${owner}/${repo}`;

    console.log('Starting GitHub deployment...');
    console.log(`Target repository: ${repository}`);
    
    // Check if repository exists
    console.log('Step 1: Checking repository access...');
    const repoResponse = await fetch(`${baseUrl}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        throw new Error(`Repository ${repository} not found or access denied`);
      }
      throw new Error(`Failed to access repository: ${repoResponse.statusText}`);
    }

    console.log('Step 2: Getting repository default branch...');
    const repoData = await repoResponse.json();
    const defaultBranch = repoData.default_branch || 'main';

    // Get the latest commit SHA for the default branch
    console.log('Step 3: Getting latest commit...');
    const branchResponse = await fetch(`${baseUrl}/branches/${defaultBranch}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!branchResponse.ok) {
      throw new Error(`Failed to get branch info: ${branchResponse.statusText}`);
    }

    const branchData = await branchResponse.json();
    const latestCommitSha = branchData.commit.sha;

    console.log('Step 4: Creating tree with files...');
    // Create tree with all files
    const tree = [];
    
    for (const file of files) {
      console.log(`Processing: ${file.name} (${file.content.length} bytes)`);
      
      // Create blob for each file
      const blobResponse = await fetch(`${baseUrl}/git/blobs`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: btoa(unescape(encodeURIComponent(file.content))), // Base64 encode
          encoding: 'base64',
        }),
      });

      if (!blobResponse.ok) {
        throw new Error(`Failed to create blob for ${file.name}: ${blobResponse.statusText}`);
      }

      const blobData = await blobResponse.json();
      
      tree.push({
        path: file.name,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha,
      });
    }

    // Create new tree
    const treeResponse = await fetch(`${baseUrl}/git/trees`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base_tree: latestCommitSha,
        tree: tree,
      }),
    });

    if (!treeResponse.ok) {
      throw new Error(`Failed to create tree: ${treeResponse.statusText}`);
    }

    const treeData = await treeResponse.json();

    console.log('Step 5: Creating commit...');
    // Create commit
    const commitResponse = await fetch(`${baseUrl}/git/commits`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Deploy website files - ${new Date().toISOString()}`,
        tree: treeData.sha,
        parents: [latestCommitSha],
      }),
    });

    if (!commitResponse.ok) {
      throw new Error(`Failed to create commit: ${commitResponse.statusText}`);
    }

    const commitData = await commitResponse.json();

    console.log('Step 6: Updating branch reference...');
    // Update branch reference
    const refResponse = await fetch(`${baseUrl}/git/refs/heads/${defaultBranch}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sha: commitData.sha,
      }),
    });

    if (!refResponse.ok) {
      throw new Error(`Failed to update branch: ${refResponse.statusText}`);
    }

    console.log('GitHub deployment completed successfully');

    const githubUrl = `https://github.com/${repository}`;
    const pagesUrl = `https://${owner}.github.io/${repo}`;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully deployed ${files.length} files to GitHub repository: ${repository}`,
        url: githubUrl,
        pagesUrl: pagesUrl,
        deployedFiles: files.map(f => f.name),
        timestamp: new Date().toISOString(),
        commitSha: commitData.sha,
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
    console.error('GitHub deployment error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown GitHub deployment error',
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
})
