import { z } from 'zod';

export const schema = z.looseObject({
  id: z.string(),
  name: z.string().nullish(),
});

export const relationships = [
  {
    field: 'descriptors',
    type: 'manyOf',
    target: 'meshDescriptor',
  },
];
