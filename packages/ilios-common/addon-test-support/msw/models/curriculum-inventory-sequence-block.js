import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    required: z.number().optional(),
    childSequenceOrder: z.number().optional(),
    orderInSequence: z.number().optional(),
    minimum: z.number().optional(),
    maximum: z.number().optional(),
    track: z.boolean().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    duration: z.number().optional(),
    academicLevel: z.number().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'startingAcademicLevel',
    type: 'oneOf',
    target: 'curriculumInventoryAcademicLevel',
  },
  {
    field: 'endingAcademicLevel',
    type: 'oneOf',
    target: 'curriculumInventoryAcademicLevel',
  },
  {
    field: 'parent',
    type: 'oneOf',
    target: 'curriculumInventorySequenceBlock',
  },
  {
    field: 'children',
    type: 'manyOf',
    target: 'curriculumInventorySequenceBlock',
  },
  {
    field: 'report',
    type: 'oneOf',
    target: 'curriculumInventoryReport',
  },
  {
    field: 'sessions',
    type: 'manyOf',
    target: 'session',
  },
  {
    field: 'excludedSessions',
    type: 'manyOf',
    target: 'session',
  },
  {
    field: 'course',
    type: 'oneOf',
    target: 'course',
  },
];
