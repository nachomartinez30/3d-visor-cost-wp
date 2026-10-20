import { describe, expect, it } from 'vitest';
import { validateContact } from '../contactValidation';

const valid = { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+54 11 5555-1234', notes: '' };

describe('validateContact', () => {
  it('accepts a complete contact', () => {
    expect(validateContact(valid)).toEqual({});
  });

  it('requires name, email and phone', () => {
    expect(validateContact({ name: ' ', email: '', phone: '', notes: '' })).toEqual({
      name: 'REQUIRED',
      email: 'REQUIRED',
      phone: 'REQUIRED',
    });
  });

  it.each(['ada', 'ada@', 'ada@example', 'a b@example.com'])('rejects email %s', (email) => {
    expect(validateContact({ ...valid, email }).email).toBe('INVALID_EMAIL');
  });

  it.each(['12345', 'phone-me', '+54 (11) 5555-1234-99999999'])('rejects phone %s', (phone) => {
    expect(validateContact({ ...valid, phone }).phone).toBe('INVALID_PHONE');
  });

  it.each(['1155551234', '+1 (555) 123-4567', '011 4444 5555'])('accepts phone %s', (phone) => {
    expect(validateContact({ ...valid, phone }).phone).toBeUndefined();
  });

  it('limits the notes length', () => {
    expect(validateContact({ ...valid, notes: 'x'.repeat(2001) }).notes).toBe('TOO_LONG');
  });
});
