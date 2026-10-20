import { brand } from './brand';

interface LogoProps {
  readonly size?: number;
  readonly withName?: boolean;
}

/** Placeholder logo: stacked layers on a rounded square. Replace freely. */
export function Logo({ size = 36, withName = true }: LogoProps) {
  return (
    <span className="logo">
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
        <rect width="32" height="32" rx="7" fill="var(--color-navy)" />
        <path
          d="M8 23h16M10 19h12M12 15h8M14 11h4"
          stroke="var(--color-orange)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      {withName && <span className="logo__name">{brand.name}</span>}
    </span>
  );
}
