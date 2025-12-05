import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    aamcCode: z.string().optional(),
    addressStreet: z.string().optional(),
    addressCity: z.string().optional(),
    addressStateOrProvince: z.string().optional(),
    addressZipcode: z.string().optional(),
    addressCountryCode: z.string().optional(),
  })
  .passthrough();

export const relations = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
];
