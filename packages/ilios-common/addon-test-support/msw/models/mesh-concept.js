import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    preferred: z.boolean().optional(),
    scopeNote: z.string().optional(),
    casn1Name: z.string().optional(),
    registryNumber: z.string().optional(),
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
