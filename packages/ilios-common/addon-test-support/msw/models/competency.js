import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  active: z.boolean().nullish(),
});

export const relationships = [
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
  {
    field: 'parent',
    type: 'oneOf',
    target: 'competency',
  },
  {
    field: 'children',
    type: 'manyOf',
    target: 'competency',
  },
  {
    field: 'aamcPcrses',
    type: 'manyOf',
    target: 'aamcPcrs',
  },
  {
    field: 'programYears',
    type: 'manyOf',
    target: 'programYear',
  },
  {
    field: 'programYearObjectives',
    type: 'manyOf',
    target: 'programYearObjective',
  },
];
