import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    description: z.string().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'report',
    type: 'oneOf',
    target: 'curriculumInventoryReport',
  },
];
