import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PublishRequest {
  subscriptionId: string;
}

const generateSubdomain = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const executeSyncCommand = async (): Promise<void> => {
  try {
    console.log('Executing sync command...');
    
    const command = new Deno.Command("python3", {
      args: ["/home/devsecops/sysncfile/sync.py"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();
    
    const stdoutText = new TextDecoder().decode(stdout);
    const stderrText = new TextDecoder().decode(stderr);
    
    console.log(`Sync command exit code: ${code}`);
    console.log(`Sync command stdout: ${stdoutText}`);
    
    if (code !== 0) {
      console.error(`Sync command stderr: ${stderrText}`);
      throw new Error(`Sync command failed with exit code ${code}: ${stderrText}`);
    }
    
    console.log('Sync command completed successfully');
  } catch (error) {
    console.error('Error executing sync command:', error);
    throw error;
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { subscriptionId }: PublishRequest = await req.json();

    if (!subscriptionId) {
      return new Response(
        JSON.stringify({ error: 'Subscription ID is required' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get subscription details to find the product category
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('user_subscriptions')
      .select('product_category')
      .eq('id', subscriptionId)
      .single();

    if (subscriptionError) {
      throw subscriptionError;
    }

    // Get domain name from product category
    const { data: category, error: categoryError } = await supabaseClient
      .from('product_categories')
      .select('domain_name')
      .eq('name', subscription.product_category)
      .single();

    if (categoryError) {
      throw categoryError;
    }

    // Always generate random unique subdomain
    let subdomain: string;
    let fullDomain: string;
    let isUnique = false;
    let attempts = 0;
    
    // Generate unique random subdomain
    do {
      subdomain = generateSubdomain();
      attempts++;
      
      // Check if subdomain already exists
      const { data: existingSubscription } = await supabaseClient
        .from('user_subscriptions')
        .select('id')
        .eq('subdomain', subdomain)
        .single();
      
      isUnique = !existingSubscription;
      
      if (attempts > 10) {
        throw new Error('Failed to generate unique subdomain');
      }
    } while (!isUnique);
    
    // Set fullDomain based on category domain configuration
    if (category?.domain_name) {
      // If domain_name contains a dot, it's a full domain, otherwise treat as subdomain
      if (category.domain_name.includes('.')) {
        fullDomain = category.domain_name;
      } else {
        fullDomain = `${category.domain_name}.appsku.my.id`;
      }
    } else {
      // Fallback to random subdomain with default domain
      fullDomain = `${subdomain}.appsku.my.id`;
    }

    // Update subscription with subdomain
    const { error: updateError } = await supabaseClient
      .from('user_subscriptions')
      .update({ subdomain })
      .eq('id', subscriptionId);

    if (updateError) {
      throw updateError;
    }

    // Create deployment status record
    const { error: deploymentError } = await supabaseClient
      .from('deployment_status')
      .insert({
        subscription_id: subscriptionId,
        subdomain,
        status: 'preparing'
      });

    if (deploymentError) {
      console.error('Error creating deployment status:', deploymentError);
    }

    // Execute sync command in background
    EdgeRuntime.waitUntil(
      executeSyncCommand()
        .then(async () => {
          // Update deployment status to completed
          await supabaseClient
            .from('deployment_status')
            .update({ status: 'completed' })
            .eq('subscription_id', subscriptionId);
        })
        .catch(async (error) => {
          console.error('Sync command failed:', error);
          // Update deployment status to failed
          await supabaseClient
            .from('deployment_status')
            .update({ status: 'failed' })
            .eq('subscription_id', subscriptionId);
        })
    );

    return new Response(
      JSON.stringify({
        success: true,
        subdomain,
        fullDomain,
        message: 'Website dan domain Anda sedang dalam persiapan. Estimasi waktu aktif 1-10 menit.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in publish-website function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);