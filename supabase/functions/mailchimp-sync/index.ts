
import { serve } from "https://deno.land/std@0.132.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.192.0/crypto/mod.ts";
import { toHashString } from "https://deno.land/std@0.192.0/crypto/to_hash_string.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function md5(message: string): Promise<string> {
  const hash = await crypto.subtle.digest(
    "MD5",
    new TextEncoder().encode(message)
  );
  return toHashString(hash);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { subscription_id } = await req.json()
    if (!subscription_id) throw new Error("Subscription ID is required.")

    console.log(`Syncing subscription ${subscription_id} to Mailchimp.`);

    // 1. Fetch subscription details
    const { data: subscription, error: subError } = await supabaseClient
      .from('user_subscriptions')
      .select('customer_email, customer_name, subscription_status')
      .eq('id', subscription_id)
      .single()
    if (subError) throw subError
    console.log("Subscription data fetched:", subscription);


    // 2. Fetch Mailchimp settings
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from('app_settings')
      .select('key, value')
      .in('key', ['mailchimp_api_key', 'mailchimp_list_id'])
    if (settingsError) throw settingsError
    
    const settings = settingsData.reduce((acc, { key, value }) => {
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    const apiKey = settings.mailchimp_api_key;
    const listId = settings.mailchimp_list_id;

    if (!apiKey || !listId) {
      console.error("Mailchimp API Key or List ID not configured.");
      throw new Error("Mailchimp API Key or List ID not configured.")
    }
    console.log("Mailchimp settings loaded.");

    const dc = apiKey.split('-')[1];
    if (!dc) {
      throw new Error("Invalid Mailchimp API Key format.");
    }
    const subscriberHash = await md5(subscription.customer_email.toLowerCase());

    // 3. Map status to Mailchimp status
    let mailchimpStatus;
    switch (subscription.subscription_status) {
        case 'active':
            mailchimpStatus = 'subscribed';
            break;
        case 'expired':
        case 'cancelled':
            mailchimpStatus = 'unsubscribed';
            break;
        default:
            console.log(`Status '${subscription.subscription_status}' does not trigger a Mailchimp sync.`);
            return new Response(JSON.stringify({ message: "No action taken for this status." }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
    }

    // 4. Call Mailchimp API
    console.log(`Updating Mailchimp member ${subscription.customer_email} with status ${mailchimpStatus}`);
    const response = await fetch(`https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${subscriberHash}`, {
      method: 'PUT',
      headers: {
        'Authorization': `apikey ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: subscription.customer_email,
        status: mailchimpStatus,
        merge_fields: {
          FNAME: subscription.customer_name?.split(' ')[0] || '',
          LNAME: subscription.customer_name?.split(' ').slice(1).join(' ') || '',
        },
      }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error("Mailchimp API Error:", errorBody);
        throw new Error(`Mailchimp API error: ${errorBody.title} - ${errorBody.detail}`);
    }
    
    console.log("Successfully synced to Mailchimp.");
    return new Response(JSON.stringify({ success: true, message: "Synced with Mailchimp" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Error in mailchimp-sync function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
