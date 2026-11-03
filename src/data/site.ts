// Single source of truth for site-wide identity. Change the domain with the
// PUBLIC_SITE_URL environment variable (see astro.config.mjs).
export const SITE_URL = (import.meta.env.SITE ?? 'https://approveddecorators.co.uk').replace(/\/$/, '');
export const SITE_NAME = 'ApprovedDecorators';

// NOTE: placeholder-looking number carried over from the original site.
// Replace with the real business line before launch (see docs/).
export const PHONE_DISPLAY = '0800 123 4567';
export const PHONE_TEL = '08001234567';
export const PHONE_E164 = '+44-800-123-4567';

export const SERVICES = [
  {
    id: 'exterior-house-painting',
    name: 'Exterior House Painting',
    shortName: 'Exterior Painting',
    icon: '🏡',
    summary: 'Weather-resistant masonry painting, timber sash window restoration, and heritage brick protection.',
  },
  {
    id: 'commercial-office-decorators',
    name: 'Commercial Office Decorators',
    shortName: 'Commercial Decorators',
    icon: '🏢',
    summary: 'Out-of-hours painting for offices, retail stores and commercial venues to minimise business disruption.',
  },
  {
    id: 'wallpaper-hanging-specialists',
    name: 'Premium Wallpaper Hanging',
    shortName: 'Wallpaper Hanging',
    icon: '📜',
    summary: 'Installation of designer papers, murals and feature walls around period features and high ceilings.',
  },
  {
    id: 'kitchen-cabinet-spray-painting',
    name: 'Kitchen Cabinet Spray Painting',
    shortName: 'Cabinet Spraying',
    icon: '🍳',
    summary: 'Spray-finished kitchen doors and carcasses as an alternative to replacing the whole kitchen.',
  },
] as const;

/** Absolute canonical URL for a site path: no trailing slash, except the homepage ("/"). */
export function absoluteUrl(path: string): string {
  const clean = path.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '');
  return clean ? `${SITE_URL}${clean.startsWith('/') ? '' : '/'}${clean}` : `${SITE_URL}/`;
}

export const ORG_ID = `${SITE_URL}/#organization`;
