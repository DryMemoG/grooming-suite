import { BrandingSchema, type Branding } from '@grooming-suite/shared';

export function getBranding(): Branding {
  return BrandingSchema.parse({
    appName: process.env.APP_NAME ?? 'Grooming Suite',
    logoUrl: process.env.APP_LOGO_URL || undefined,
    primaryColor: process.env.APP_PRIMARY_COLOR ?? '#4F46E5',
    secondaryColor: process.env.APP_SECONDARY_COLOR ?? '#22C55E',
  });
}