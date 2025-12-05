import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    year: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .passthrough();

export const relations = [
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
