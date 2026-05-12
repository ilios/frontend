import { z } from 'zod';

export const schema = z.looseObject({
  id: z.string(),
  treeNumber: z.string().nullish(),
});

export const relationships = [
  {
    field: 'descriptor',
    type: 'oneOf',
    target: 'meshDescriptor',
  },
];
