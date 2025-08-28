import type { Handler } from '@netlify/functions';

type ContactPayload = {
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  phone?: string;
  message?: string;
};

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || '';
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    if (!CONTACT_TO_EMAIL) {
      return { statusCode: 500, body: 'CONTACT_TO_EMAIL is not configured' };
    }
    if (!RESEND_API_KEY) {
      return { statusCode: 500, body: 'RESEND_API_KEY is not configured' };
    }

    const body: ContactPayload = JSON.parse(event.body || '{}');
    const first = (body.first_name || '').trim();
    const middle = (body.middle_name || '').trim();
    const last = (body.last_name || '').trim();
    const phone = (body.phone || '').trim();
    const message = (body.message || '').trim();

    const fullName = [first, middle, last].filter(Boolean).join(' ').trim() || 'Visitor';

    const subject = `New contact message from ${fullName}`;
    const text = `Name: ${fullName}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message || '(empty)'}`;
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#111">
        <h2 style="margin:0 0 8px">New contact message</h2>
        <p style="margin:0 0 4px"><strong>Name:</strong> ${escapeHtml(fullName)}</p>
        <p style="margin:0 0 12px"><strong>Phone:</strong> ${escapeHtml(phone || 'N/A')}</p>
        <div style="padding:12px;border-radius:8px;background:#f6f7f9;border:1px solid #e5e7eb;white-space:pre-wrap">${escapeHtml(message || '(empty)')}</div>
      </div>
    `;

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>',
        to: [CONTACT_TO_EMAIL],
        subject,
        text,
        html,
        reply_to: CONTACT_TO_EMAIL,
      }),
    });

    if (!resp.ok) {
      const errTxt = await resp.text();
      return { statusCode: 502, body: `Email provider error: ${errTxt}` };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ ok: true }),
    };
  } catch (e: any) {
    return { statusCode: 400, body: 'Invalid request' };
  }
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

