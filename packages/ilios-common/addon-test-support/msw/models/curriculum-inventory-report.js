import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  year: z.number().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
});

export const relationships = [
  {
    field: 'export',
    type: 'oneOf',
    target: 'curriculumInventoryExport',
  },
  {
    field: 'sequence',
    type: 'oneOf',
    target: 'curriculumInventorySequence',
  },
  {
    field: 'sequenceBlocks',
    type: 'manyOf',
    target: 'curriculumInventorySequenceBlock',
  },
  {
    field: 'program',
    type: 'oneOf',
    target: 'program',
  },
  {
    field: 'academicLevels',
    type: 'manyOf',
    target: 'curriculumInventoryAcademicLevel',
  },
  {
    field: 'administrators',
    type: 'manyOf',
    target: 'user',
  },
];
