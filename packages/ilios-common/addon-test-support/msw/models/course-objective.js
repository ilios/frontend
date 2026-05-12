import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  position: z.number().nullish(),
  active: z.boolean().nullish(),
});

export const relationships = [
  {
    field: 'course',
    type: 'oneOf',
    target: 'course',
  },
  {
    field: 'ancestor',
    type: 'oneOf',
    target: 'courseObjective',
  },
  {
    field: 'descendants',
    type: 'manyOf',
    target: 'courseObjective',
  },
  {
    field: 'meshDescriptors',
    type: 'manyOf',
    target: 'meshDescriptor',
  },
  {
    field: 'terms',
    type: 'manyOf',
    target: 'term',
  },
  {
    field: 'programYearObjectives',
    type: 'manyOf',
    target: 'programYearObjective',
  },
];
