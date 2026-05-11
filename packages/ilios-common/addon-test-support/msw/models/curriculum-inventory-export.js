import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    document: z.string().nullish(),
    createdAt: z.string().nullish(),
  })
  .passthrough();

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
