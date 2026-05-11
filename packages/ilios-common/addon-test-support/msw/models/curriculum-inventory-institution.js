import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    name: z.string().nullish(),
    aamcCode: z.string().nullish(),
    addressStreet: z.string().nullish(),
    addressCity: z.string().nullish(),
    addressStateOrProvince: z.string().nullish(),
    addressZipcode: z.string().nullish(),
    addressCountryCode: z.string().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
];
