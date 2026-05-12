import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  required: z.number().nullish(),
  childSequenceOrder: z.number().nullish(),
  orderInSequence: z.number().nullish(),
  minimum: z.number().nullish(),
  maximum: z.number().nullish(),
  track: z.boolean().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
  duration: z.number().nullish(),
  academicLevel: z.number().nullish(),
});

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
