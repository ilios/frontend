import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    treeNumber: z.string().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'descriptor',
    type: 'oneOf',
    target: 'meshDescriptor',
  },
];
