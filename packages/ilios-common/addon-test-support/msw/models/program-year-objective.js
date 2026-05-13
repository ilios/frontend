import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  position: z.number().nullish(),
  active: z.boolean().nullish(),
});

export const relationships = [
  {
    field: 'competency',
    type: 'oneOf',
    target: 'competency',
  },
  {
    field: 'programYear',
    type: 'oneOf',
    target: 'programYear',
  },
  {
    field: 'terms',
    type: 'manyOf',
    target: 'term',
  },
  {
    field: 'meshDescriptors',
    type: 'manyOf',
    target: 'meshDescriptor',
  },
  {
    field: 'ancestor',
    type: 'oneOf',
    target: 'programYearObjective',
    role: 'descendants',
  },
  {
    field: 'descendants',
    type: 'manyOf',
    target: 'programYearObjective',
    role: 'descendants',
  },
  {
    field: 'courseObjectives',
    type: 'manyOf',
    target: 'courseObjective',
  },
];
