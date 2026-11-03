// Cloudflare Pages Function: POST /api/quote
// Forwards quote requests as JSON to the webhook set in the QUOTE_WEBHOOK_URL
// environment variable (e.g. a Zapier / Make / Slack / CRM inbound webhook).
// Without that variable the endpoint answers 503 so the page can tell the
// visitor to phone instead of pretending the request was sent.

const MAX_FIELD = 2000;

function clean(value) {
  return String(value ?? '').trim().slice(0, MAX_FIELD);
}

export async function onRequestPost({ request, env }) {
  let input;
  try {
    input = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  // Honeypot: real visitors never fill the hidden "website" field.
  if (clean(input.website)) {
    return Response.json({ ok: true });
  }

  const lead = {
    name: clean(input.name),
    contact: clean(input.contact),
    location: clean(input.location),
    details: clean(input.details),
    service: clean(input.service),
    page: clean(input.page),
    submittedAt: new Date().toISOString(),
  };

  if (!lead.name || !lead.contact) {
    return Response.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  if (!env.QUOTE_WEBHOOK_URL) {
    return Response.json({ ok: false, error: 'not_configured' }, { status: 503 });
  }

  const res = await fetch(env.QUOTE_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(lead),
  });

  if (!res.ok) {
    return Response.json({ ok: false, error: 'upstream_failed' }, { status: 502 });
  }
  return Response.json({ ok: true });
}
