import nodemailer from 'nodemailer';
import config from '../config/index.js';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!config.smtp.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
      auth: config.smtp.user
        ? { user: config.smtp.user, pass: config.smtp.pass }
        : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email skipped] SMTP not configured. Would send to ${to}: ${subject}`);
    return;
  }
  try {
    await transport.sendMail({
      from: config.smtp.from,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`[Email error] Failed to send to ${to}:`, err);
    // Swallow error — fire-and-forget
  }
}

export function buildStatusChangeEmail(params: {
  ticketKey: string;
  ticketTitle: string;
  oldStatus: string;
  newStatus: string;
  changedByName: string;
  ticketUrl: string;
}): { subject: string; html: string } {
  const subject = `[${params.ticketKey}] Status changed to ${params.newStatus}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #4f46e5; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
        <h2 style="margin: 0; font-size: 18px;">${params.ticketKey}: ${params.ticketTitle}</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 16px; color: #374151;">
          <strong>${params.changedByName}</strong> changed the status from
          <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-weight: 600;">${params.oldStatus}</span>
          to
          <span style="background: #dbeafe; padding: 2px 8px; border-radius: 4px; font-weight: 600; color: #1d4ed8;">${params.newStatus}</span>
        </p>
        <a href="${params.ticketUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500;">View Ticket</a>
      </div>
      <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
        You received this because you are following this ticket.
      </p>
    </div>
  `;
  return { subject, html };
}
