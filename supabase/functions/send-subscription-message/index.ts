
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  customerName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, customerName }: EmailRequest = await req.json();

    const emailHtml = `
      <h1>Halo ${customerName},</h1>
      <p>Anda menerima pesan dari admin:</p>
      <div style="padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background-color: #f8fafc;">
        ${message.replace(/\n/g, '<br>')}
      </div>
      <p>Salam,<br>Tim Dukungan</p>
    `;

    const { data, error } = await resend.emails.send({
      from: "Tim Dukungan <info@ksainovasi.com>",
      to: [to],
      subject: subject,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend API error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-subscription-message function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
