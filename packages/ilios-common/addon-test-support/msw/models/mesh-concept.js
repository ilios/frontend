import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().nullish(),
    preferred: z.boolean().nullish(),
    scopeNote: z.string().nullish(),
    casn1Name: z.string().nullish(),
    registryNumber: z.string().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'terms',
    type: 'manyOf',
    target: 'meshTerm',
  },
  {
    field: 'descriptors',
    type: 'manyOf',
    target: 'meshDescriptor',
  },
];
