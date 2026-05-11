import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().optional(),
    shortTitle: z.string().optional(),
    duration: z.number().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
  {
    field: 'programYears',
    type: 'manyOf',
    target: 'programYear',
  },
  {
    field: 'directors',
    type: 'manyOf',
    target: 'user',
  },
  {
    field: 'curriculumInventoryReports',
    type: 'manyOf',
    target: 'curriculumInventoryReport',
  },
];
