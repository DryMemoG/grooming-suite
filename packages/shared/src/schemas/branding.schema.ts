import { z } from 'zod';

export const BrandingSchema = z.object({
  appName: z.string().min(1),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
  secondaryColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/),
});

export type Branding = z.infer<typeof BrandingSchema>;