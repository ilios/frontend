import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    lexicalTag: z.string().optional(),
    conceptPreferred: z.boolean().optional(),
    recordPreferred: z.boolean().optional(),
    permuted: z.boolean().optional(),
  })
  .passthrough();

export const relations = [
  {
    field: 'concepts',
    type: 'manyOf',
    target: 'meshConcept',
  },
];
