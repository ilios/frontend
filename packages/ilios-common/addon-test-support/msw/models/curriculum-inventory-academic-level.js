import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    level: z.number().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'report',
    type: 'oneOf',
    target: 'curriculumInventoryReport',
  },
  {
    field: 'startingSequenceBlocks',
    type: 'manyOf',
    target: 'curriculumInventorySequenceBlock',
  },
  {
    field: 'endingSequenceBlocks',
    type: 'manyOf',
    target: 'curriculumInventorySequenceBlock',
  },
];
