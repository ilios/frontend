import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  document: z.string().nullish(),
  createdAt: z.string().nullish(),
});

export const relationships = [
  {
    field: 'report',
    type: 'oneOf',
    target: 'curriculumInventoryReport',
  },
  {
    field: 'createdBy',
    type: 'oneOf',
    target: 'user',
  },
];
