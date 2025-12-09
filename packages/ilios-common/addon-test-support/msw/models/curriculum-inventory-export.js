import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    document: z.string().optional(),
    createdAt: z.string().optional(),
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
