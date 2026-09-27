/**
 * Shared validation — imported by BOTH the browser form and the API route,
 * so client and server can never drift (a common Webflow-forms pitfall).
 */
export interface ContactInput {
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message: string;
  website?: string; // honeypot — must stay empty
}

export function validateContact(input: ContactInput): Record<string, string> {
  const errors: Record<string, string> = {};
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!input.name?.trim() || input.name.trim().length < 2) errors.name = 'Please enter your name (min. 2 characters).';
  if (!input.email?.trim() || !emailRe.test(input.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!input.message?.trim() || input.message.trim().length < 20)
    errors.message = 'Tell us a little more — at least 20 characters helps us reply well.';
  if (input.message && input.message.length > 5000) errors.message = 'Message is too long (max 5,000 characters).';
  if (input.website?.trim()) errors.website = 'Spam detected.';

  return errors;
}

export function isValid(errors: Record<string, string>): boolean {
  return Object.keys(errors).length === 0;
}
