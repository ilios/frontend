import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    previousIndexing: z.string().optional(),
  })
  .passthrough();

export const relations = [
  {
    field: 'descriptor',
    type: 'oneOf',
    target: 'meshDescriptor',
  },
];
