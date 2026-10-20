import type { ServiceIcon as IconName } from '../data/company.mock';

const paths: Record<IconName, string> = {
  prototype: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zm0 0v18M4 7.5l8 4.5 8-4.5',
  batch: 'M4 6h7v5H4zM13 6h7v5h-7zM4 13h7v5H4zM13 13h7v5h-7z',
  design: 'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3',
  finish: 'M5 19l6-6M14 4l1.5 3.5L19 9l-3.5 1.5L14 14l-1.5-3.5L9 9l3.5-1.5L14 4z',
};

export function ServiceIcon({ name }: { readonly name: IconName }) {
  return (
    <svg className="service-icon" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={paths[name]} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
