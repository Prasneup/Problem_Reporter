import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")
const ADMIN_EMAILS = [
  "prasannaneupane723@gmail.com",
  "yogeshpulami779@gmail.com",
  "rajan84210@gmail.com"
]

serve(async (req) => {
  try {
    const payload = await req.json()
    const { record } = payload

    // Only process support desk request notifications
    if (record && record.title === 'New Support Desk Inquiry') {
      const emailBody = `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; margin-top: 0;">New Support Desk Inquiry</h2>
          <p style="font-size: 14px; line-height: 1.6;">A new support request was submitted by a citizen on the Ghorahi Smart City Portal.</p>
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px;">
            <p style="margin: 0 0 8px 0;"><strong>Details:</strong></p>
            <p style="margin: 0; font-family: monospace; white-space: pre-wrap; line-height: 1.5;">${record.message}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
          <p style="font-size: 11px; color: #94a3b8; margin: 0;">Ghorahi Sub-Metropolitan Grievance Redressal System • Database Auto-Webhook Trigger</p>
        </div>
      `

      // Send separate emails to each admin to handle Resend sandbox limitations gracefully
      for (const email of ADMIN_EMAILS) {
        try {
          const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
              from: "Ghorahi Portal Support <onboarding@resend.dev>",
              to: [email],
              subject: `[Support Ticket] Ghorahi Smart City Portal Inquiry`,
              html: emailBody
            })
          });

          if (!response.ok) {
            console.error(`Failed to send email to ${email}:`, await response.text());
          } else {
            console.log(`Successfully sent support email to ${email}`);
          }
        } catch (err) {
          console.error(`Error sending email to ${email}:`, err);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }
})
