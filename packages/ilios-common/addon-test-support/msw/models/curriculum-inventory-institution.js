import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    name: z.string().optional(),
    aamcCode: z.string().optional(),
    addressStreet: z.string().optional(),
    addressCity: z.string().optional(),
    addressStateOrProvince: z.string().optional(),
    addressZipcode: z.string().optional(),
    addressCountryCode: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
];
