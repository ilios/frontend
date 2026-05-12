import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  shortTitle: z.string().nullish(),
  duration: z.number().nullish(),
});

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
