import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().nullish(),
    lexicalTag: z.string().nullish(),
    conceptPreferred: z.boolean().nullish(),
    recordPreferred: z.boolean().nullish(),
    permuted: z.boolean().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'concepts',
    type: 'manyOf',
    target: 'meshConcept',
  },
];
