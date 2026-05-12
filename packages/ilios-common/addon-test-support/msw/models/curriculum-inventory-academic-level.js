import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  level: z.number().nullish(),
});

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
