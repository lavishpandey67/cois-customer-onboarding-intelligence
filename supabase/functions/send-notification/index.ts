import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  try {
    const { type, to, data } = await req?.json();
    const RESEND_API_KEY = (typeof Deno !== "undefined" ? Deno : (globalThis as any)?.Deno)?.env?.get("RESEND_API_KEY");
    const SITE_URL = (typeof Deno !== "undefined" ? Deno : (globalThis as any)?.Deno)?.env?.get("SITE_URL") || "https://cois8196.builtwithrocket.new";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    let subject = "";
    let html = "";

    if (type === "risk_alert") {
      subject = `🚨 Critical Risk Alert — ${data?.customerName} | COIS`;
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #0f172a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 700; letter-spacing: -0.3px;">COIS — Customer Onboarding Intelligence</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">B2B SaaS Platform — Demo Environment</p>
          </div>
          <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="color: #dc2626; font-size: 13px; font-weight: 700; margin: 0 0 4px;">🚨 Critical Risk Alert</p>
              <p style="color: #7f1d1d; font-size: 13px; margin: 0;">Immediate attention required</p>
            </div>
            <h2 style="font-size: 20px; color: #0f172a; margin: 0 0 8px; font-weight: 700;">${data?.customerName}</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0 0 20px;">${data?.tier} · ${data?.region}</p>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr style="background: #f8fafc;">
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0; width: 40%;">Issue</td>
                <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data?.issue}</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Severity</td>
                <td style="padding: 10px 14px; font-size: 13px; color: #dc2626; font-weight: 700; border-bottom: 1px solid #e2e8f0;">${data?.severity}</td>
              </tr>
              <tr style="background: #f8fafc;">
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600; border-bottom: 1px solid #e2e8f0;">Days Inactive</td>
                <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${data?.daysSinceLastActivity} days</td>
              </tr>
              <tr>
                <td style="padding: 10px 14px; font-size: 12px; color: #64748b; font-weight: 600;">Revenue at Risk</td>
                <td style="padding: 10px 14px; font-size: 13px; color: #0f172a; font-weight: 700;">$${Number(data?.revenueAtRisk)?.toLocaleString()}</td>
              </tr>
            </table>
            <a href="${SITE_URL}/customer-management" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">View in COIS →</a>
            <p style="color: #94a3b8; font-size: 11px; margin: 24px 0 0;">This alert was sent automatically by COIS. Assigned manager: ${data?.manager}</p>
          </div>
        </div>`;
    } else if (type === "team_invitation") {
      subject = `You've been invited to COIS — ${data?.invitedByName} invited you`;
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #0f172a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 700;">COIS — Customer Onboarding Intelligence</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">B2B SaaS Platform — Demo Environment</p>
          </div>
          <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="font-size: 20px; color: #0f172a; margin: 0 0 12px; font-weight: 700;">You've been invited to join COIS</h2>
            <p style="color: #475569; font-size: 14px; margin: 0 0 24px; line-height: 1.6;"><strong>${data?.invitedByName}</strong> has invited you to join the COIS platform as a <strong>${data?.role?.replace(/_/g, ' ')}</strong>.</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="font-size: 12px; color: #64748b; margin: 0 0 4px; font-weight: 600;">YOUR ROLE</p>
              <p style="font-size: 15px; color: #0f172a; margin: 0; font-weight: 700; text-transform: capitalize;">${data?.role?.replace(/_/g, ' ')}</p>
            </div>
            <a href="${SITE_URL}/login" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Accept Invitation →</a>
            <p style="color: #94a3b8; font-size: 11px; margin: 24px 0 0;">This invitation expires in 7 days. If you did not expect this email, you can safely ignore it.</p>
          </div>
        </div>`;
    } else if (type === "password_reset") {
      subject = "Reset your COIS password";
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #0f172a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 700;">COIS — Customer Onboarding Intelligence</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">B2B SaaS Platform — Demo Environment</p>
          </div>
          <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="font-size: 20px; color: #0f172a; margin: 0 0 12px; font-weight: 700;">Reset your password</h2>
            <p style="color: #475569; font-size: 14px; margin: 0 0 24px; line-height: 1.6;">We received a request to reset the password for your COIS account. Click the button below to set a new password.</p>
            <a href="${data?.resetLink}" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">Reset Password →</a>
            <p style="color: #94a3b8; font-size: 12px; margin: 24px 0 8px;">Or copy this link:</p>
            <p style="color: #3b82f6; font-size: 11px; word-break: break-all; margin: 0;">${data?.resetLink}</p>
            <p style="color: #94a3b8; font-size: 11px; margin: 24px 0 0;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
          </div>
        </div>`;
    } else if (type === "sla_breach") {
      subject = `⚠️ SLA Breach — ${data?.customerName} exceeded ${data?.breachType} SLA`;
      html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: #0f172a; padding: 24px 32px; border-radius: 8px 8px 0 0;">
            <h1 style="color: #ffffff; font-size: 18px; margin: 0; font-weight: 700;">COIS — SLA Breach Alert</h1>
          </div>
          <div style="padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px 20px; margin-bottom: 24px;">
              <p style="color: #d97706; font-size: 13px; font-weight: 700; margin: 0;">⚠️ SLA Breach Detected</p>
            </div>
            <h2 style="font-size: 20px; color: #0f172a; margin: 0 0 8px; font-weight: 700;">${data?.customerName}</h2>
            <p style="color: #64748b; font-size: 13px; margin: 0 0 20px;">${data?.tier} · ${data?.policyName}</p>
            <p style="color: #475569; font-size: 14px; margin: 0 0 24px;">The <strong>${data?.breachType}</strong> SLA of <strong>${data?.slaHours} hours</strong> has been exceeded by <strong>${data?.actualHours - data?.slaHours} hours</strong>.</p>
            <a href="${SITE_URL}/sla-tracker" style="display: inline-block; background: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 600;">View SLA Tracker →</a>
          </div>
        </div>`;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: [to],
        subject,
        html,
      }),
    });

    const result = await res?.json();

    if (!res?.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
