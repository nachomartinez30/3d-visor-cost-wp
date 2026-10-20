export interface ContactDetails {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly notes: string;
}

export type ContactErrorCode = 'REQUIRED' | 'INVALID_EMAIL' | 'INVALID_PHONE' | 'TOO_LONG';
export type ContactErrors = Partial<Record<keyof ContactDetails, ContactErrorCode>>;

export const MAX_NOTES_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARS = /^\+?[\d\s().-]+$/;

/** Returns an error code per invalid field; an empty object means valid. */
export const validateContact = (contact: ContactDetails): ContactErrors => {
  const errors: ContactErrors = {};
  const name = contact.name.trim();
  const email = contact.email.trim();
  const phone = contact.phone.trim();

  if (!name) errors.name = 'REQUIRED';

  if (!email) errors.email = 'REQUIRED';
  else if (!EMAIL_PATTERN.test(email)) errors.email = 'INVALID_EMAIL';

  if (!phone) errors.phone = 'REQUIRED';
  else {
    const digits = phone.replace(/\D/g, '').length;
    if (!PHONE_CHARS.test(phone) || digits < 7 || digits > 15) errors.phone = 'INVALID_PHONE';
  }

  if (contact.notes.length > MAX_NOTES_LENGTH) errors.notes = 'TOO_LONG';
  return errors;
};

export const hasErrors = (errors: ContactErrors): boolean => Object.keys(errors).length > 0;
