import { z } from 'zod';

export const schema = z.looseObject({
  id: z.string(),
  previousIndexing: z.string().nullish(),
});

export const relationships = [
  {
    field: 'descriptor',
    type: 'oneOf',
    target: 'meshDescriptor',
  },
];
