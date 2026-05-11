import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    name: z.string().nullish(),
    description: z.string().nullish(),
    level: z.number().nullish(),
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
