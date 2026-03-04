import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ADMIN_EMAIL = "m.laeticia@emotionscare.com";
const FROM_EMAIL = "contact@emotionscare.com";
const COMPANY_NAME = "EMOTIONSCARE";

async function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${COMPANY_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[contact-form] Resend error [${res.status}]: ${body}`);
    return false;
  }
  return true;
}

function buildAdminEmail(name: string, email: string, phone: string | null, subject: string, message: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 24px 32px;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 20px;">📩 Nouveau message de contact</h1>
      </div>
      <div style="padding: 24px 32px;">
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 100px;">Nom</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #f59e0b;">${escapeHtml(email)}</a></td></tr>
          ${phone ? `<tr><td style="padding: 8px 0; color: #6b7280;">Téléphone</td><td style="padding: 8px 0;">${escapeHtml(phone)}</td></tr>` : ""}
          <tr><td style="padding: 8px 0; color: #6b7280;">Sujet</td><td style="padding: 8px 0; font-weight: 600;">${escapeHtml(subject)}</td></tr>
        </table>
        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #1f2937;">${escapeHtml(message)}</p>
        </div>
        <div style="margin-top: 20px;">
          <a href="mailto:${escapeHtml(email)}?subject=Re: ${encodeURIComponent(subject)}" style="display: inline-block; background: #f59e0b; color: #1a1a2e; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Répondre</a>
        </div>
      </div>
      <div style="padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
        ${COMPANY_NAME} — Siège Social Numérique
      </div>
    </div>
  `;
}

function buildVisitorEmail(name: string, subject: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 24px 32px;">
        <h1 style="color: #f59e0b; margin: 0; font-size: 20px;">${COMPANY_NAME}</h1>
      </div>
      <div style="padding: 24px 32px;">
        <p style="font-size: 16px; color: #1f2937;">Bonjour ${escapeHtml(name)},</p>
        <p style="color: #4b5563; line-height: 1.6;">
          Nous avons bien reçu votre message concernant <strong>« ${escapeHtml(subject)} »</strong>.
        </p>
        <p style="color: #4b5563; line-height: 1.6;">
          Notre équipe l'examine et vous répondra sous <strong>24 à 48 heures ouvrées</strong>.
        </p>
        <div style="background: #fffbeb; border-radius: 8px; padding: 16px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            💡 Ceci est un accusé de réception automatique. Inutile d'y répondre.
          </p>
        </div>
        <p style="color: #4b5563;">Cordialement,<br><strong>L'équipe ${COMPANY_NAME}</strong></p>
      </div>
      <div style="padding: 16px 32px; background: #f9fafb; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
        ${COMPANY_NAME} SASU — Amiens, France
      </div>
    </div>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    // Server-side validation
    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) {
      return new Response(JSON.stringify({ error: "Nom invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Email invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!subject || typeof subject !== "string" || subject.trim().length < 2 || subject.trim().length > 200) {
      return new Response(JSON.stringify({ error: "Sujet invalide" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!message || typeof message !== "string" || message.trim().length < 10 || message.trim().length > 2000) {
      return new Response(JSON.stringify({ error: "Message invalide (10-2000 caractères)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
               req.headers.get("cf-connecting-ip") || 
               "unknown";

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting: max 5 messages per IP per hour
    if (ip !== "unknown") {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count, error: countError } = await supabase
        .from("contact_messages")
        .select("id", { count: "exact", head: true })
        .eq("ip_address", ip)
        .gte("created_at", oneHourAgo);

      if (!countError && count !== null && count >= 5) {
        console.warn(`[contact-form] Rate limit hit for IP: ${ip}`);
        return new Response(JSON.stringify({ error: "Trop de messages envoyés. Réessayez dans une heure." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
      ip_address: ip !== "unknown" ? ip : null,
    });

    if (insertError) {
      console.error("[contact-form] Insert error:", insertError.message);
      return new Response(JSON.stringify({ error: "Service temporairement indisponible" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[contact-form] Message saved from ${email.trim()}`);

    // Send emails via Resend (non-blocking — don't fail the request if emails fail)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (resendApiKey) {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPhone = phone?.trim() || null;
      const trimmedSubject = subject.trim();
      const trimmedMessage = message.trim();

      // Send both emails in parallel
      const [adminSent, visitorSent] = await Promise.allSettled([
        sendEmail(
          resendApiKey,
          ADMIN_EMAIL,
          `[Contact] ${trimmedSubject} — ${trimmedName}`,
          buildAdminEmail(trimmedName, trimmedEmail, trimmedPhone, trimmedSubject, trimmedMessage)
        ),
        sendEmail(
          resendApiKey,
          trimmedEmail,
          `Accusé de réception — ${COMPANY_NAME}`,
          buildVisitorEmail(trimmedName, trimmedSubject)
        ),
      ]);

      console.log(`[contact-form] Emails: admin=${adminSent.status}, visitor=${visitorSent.status}`);
    } else {
      console.warn("[contact-form] RESEND_API_KEY not configured, skipping emails");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[contact-form] Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Service temporairement indisponible" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
