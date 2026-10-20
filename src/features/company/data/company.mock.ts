/**
 * MOCK COMPANY DATA — structure and numbers only.
 * All texts for these ids are in src/i18n/locales/<lang>/company.json.
 */
export type ServiceIcon = 'prototype' | 'batch' | 'design' | 'finish';

export const services: readonly { id: string; icon: ServiceIcon }[] = [
  { id: 'prototyping', icon: 'prototype' },
  { id: 'production', icon: 'batch' },
  { id: 'design', icon: 'design' },
  { id: 'finishing', icon: 'finish' },
];

export const stats: readonly { id: string; value: number; suffix?: string }[] = [
  { id: 'parts', value: 18000, suffix: '+' },
  { id: 'printers', value: 24 },
  { id: 'turnaround', value: 72, suffix: 'h' },
  { id: 'clients', value: 350, suffix: '+' },
];

export const processSteps: readonly string[] = ['upload', 'configure', 'check', 'print', 'deliver'];

export const testimonials: readonly { id: string }[] = [{ id: 'maker' }, { id: 'engineer' }, { id: 'studio' }];
