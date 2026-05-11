import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'descriptors',
    type: 'manyOf',
    target: 'meshDescriptor',
  },
];
