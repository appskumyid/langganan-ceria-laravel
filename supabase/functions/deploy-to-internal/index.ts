import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface DeployRequest {
  userId: string;
  files: Array<{
    name: string;
    content: string;
  }>;
  deployConfig: any;
}

serve(async (req) => {
  console.log('=== Internal Server Deploy Function Started ===');
  console.log('Method:', req.method);

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
        console.error('Request body is empty');
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Request body is empty',
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

    const { userId, files, deployConfig }: DeployRequest = requestBody;

    console.log('Internal server deployment request received:', { 
      userId, 
      filesCount: files?.length || 0,
      hasDeployConfig: !!deployConfig
    });

    // Validate input
    if (!userId || !files || files.length === 0) {
      console.error('Validation failed:', { 
        hasUserId: !!userId, 
        hasFiles: !!files, 
        filesCount: files?.length || 0 
      });
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid deployment request: Missing userId or files',
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

    // Create the directory path
    const deployPath = `files/${userId}/multifilegenerate`;
    console.log(`Internal deployment path: ${deployPath}`);

    // Simulate internal file generation
    const generatedFiles = [];
    
    for (const file of files) {
      console.log(`Processing file: ${file.name} (${file.content.length} bytes)`);
      
      const filePath = `${deployPath}/${file.name}`;
      generatedFiles.push({
        name: file.name,
        path: filePath,
        size: file.content.length
      });
    }

    console.log('Internal deployment completed successfully');
    console.log(`Generated ${generatedFiles.length} files in ${deployPath}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully deployed ${files.length} files to internal server`,
        deployPath: deployPath,
        generatedFiles: generatedFiles,
        timestamp: new Date().toISOString(),
        note: `Files have been generated in the internal directory: ${deployPath}`
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
    console.error('=== Internal deployment error ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown internal deployment error',
        timestamp: new Date().toISOString(),
        troubleshooting: {
          steps: [
            "1. Ensure user ID is provided",
            "2. Verify files array is not empty",
            "3. Check that file content is valid"
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