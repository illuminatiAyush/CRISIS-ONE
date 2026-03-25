import { Resend } from 'resend';

const RESEND_API_KEY = process.env.NEXT_PUBLIC_RESENDEMAIL_API_KEY;

if (!RESEND_API_KEY) {
  console.warn("WARNING: NEXT_PUBLIC_RESENDEMAIL_API_KEY is not set. Resend functionality will be disabled.");
}

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;