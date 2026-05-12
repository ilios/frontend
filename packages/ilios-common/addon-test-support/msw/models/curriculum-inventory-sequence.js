import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  description: z.string().nullish(),
});

export const relationships = [
  {
    field: 'report',
    type: 'oneOf',
    target: 'curriculumInventoryReport',
  },
];
