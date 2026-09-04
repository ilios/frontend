import 'zod/compile'; // must come before modules that define schemas
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
