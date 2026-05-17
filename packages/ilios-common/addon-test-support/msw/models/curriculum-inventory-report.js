import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  name: z.string().nullish(),
  description: z.string().nullish(),
  year: z.coerce.number(),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
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
