interface Env {
  RESEND_API_KEY?: string;
}

interface ContactBody {
  name?: unknown;
  company?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
}

function clean(v: unknown, max = 500): string {
  if (typeof v !== 'string') return '';
  return v.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, '').trim().slice(0, max);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://intendant.uk',
    'Content-Type': 'application/json',
  };

  const key = (env.RESEND_API_KEY || '').trim();
  if (!key) {
    console.error(JSON.stringify({ level: 'error', event: 'contact_no_resend_key' }));
    return new Response(JSON.stringify({ error: 'mail_not_configured' }), { status: 503, headers: corsHeaders });
  }

  let body: ContactBody;
  try {
    body = await request.json() as ContactBody;
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), { status: 400, headers: corsHeaders });
  }

  const name    = clean(body.name, 120);
  const company = clean(body.company, 120);
  const email   = clean(body.email, 254);
  const phone   = clean(body.phone, 30);
  const message = clean(body.message, 2000);

  if (!name || !company || !email || !message) {
    return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400, headers: corsHeaders });
  }
  if (!isValidEmail(email)) {
    return new Response(JSON.stringify({ error: 'invalid_email' }), { status: 400, headers: corsHeaders });
  }

  const html = `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Company:</strong> ${company}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
    <hr />
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${message}</p>
  `;

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Intendant Contact <noreply@intendant.uk>',
      to: ['info@intendant.uk'],
      reply_to: email,
      subject: `New enquiry from ${name} — ${company}`,
      html,
    }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error(JSON.stringify({ level: 'error', event: 'contact_resend_failed', status: resendRes.status, detail: err.slice(0, 300) }));
    return new Response(JSON.stringify({ error: 'mail_send_failed' }), { status: 502, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: corsHeaders });
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://intendant.uk',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
