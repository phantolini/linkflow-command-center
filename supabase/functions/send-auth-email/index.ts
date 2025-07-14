
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AuthEmailRequest {
  email: string;
  token: string;
  type: 'signup' | 'magiclink' | 'recovery';
  redirectTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, type, redirectTo }: AuthEmailRequest = await req.json();
    
    const baseUrl = Deno.env.get("SUPABASE_URL");
    const magicLinkUrl = `${baseUrl}/auth/v1/verify?token=${token}&type=${type}&redirect_to=${redirectTo || `${Deno.env.get("SITE_URL") || "http://localhost:5173"}/`}`;

    let subject = "";
    let html = "";

    switch (type) {
      case 'signup':
        subject = "Welcome to SAWD LINK - Confirm your email";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 12px;">
            <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 30px; text-align: center;">
              <h1 style="color: white; margin-bottom: 20px; font-size: 28px;">Welcome to SAWD LINK</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin-bottom: 30px;">
                Please confirm your email address to complete your registration and start building your digital command center.
              </p>
              <a href="${magicLinkUrl}" style="display: inline-block; background: linear-gradient(135deg, #00d4ff, #8a2be2); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0;">
                Confirm Email Address
              </a>
              <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${magicLinkUrl}</span>
              </p>
            </div>
          </div>
        `;
        break;
      
      case 'magiclink':
        subject = "Your SAWD LINK Magic Link";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 12px;">
            <div style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; padding: 30px; text-align: center;">
              <h1 style="color: white; margin-bottom: 20px; font-size: 28px;">Sign in to SAWD LINK</h1>
              <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin-bottom: 30px;">
                Click the button below to securely sign in to your account.
              </p>
              <a href="${magicLinkUrl}" style="display: inline-block; background: linear-gradient(135deg, #00d4ff, #8a2be2); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 20px 0;">
                Sign In to SAWD LINK
              </a>
              <p style="color: rgba(255, 255, 255, 0.7); font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${magicLinkUrl}</span>
              </p>
              <p style="color: rgba(255, 255, 255, 0.6); font-size: 12px; margin-top: 20px;">
                This link will expire in 1 hour for security reasons.
              </p>
            </div>
          </div>
        `;
        break;
        
      default:
        throw new Error("Invalid email type");
    }

    const emailResponse = await resend.emails.send({
      from: "SAWD LINK <kemet.organization@gmail.com>",
      to: [email],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
