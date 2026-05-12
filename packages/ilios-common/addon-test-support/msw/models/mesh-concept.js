import { z } from 'zod';

export const schema = z.looseObject({
  id: z.string(),
  name: z.string().nullish(),
  preferred: z.boolean().nullish(),
  scopeNote: z.string().nullish(),
  casn1Name: z.string().nullish(),
  registryNumber: z.string().nullish(),
});

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
