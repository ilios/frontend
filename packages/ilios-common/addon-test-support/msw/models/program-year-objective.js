import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().nullish(),
    position: z.number().nullish(),
    active: z.boolean().nullish(),
  })
  .passthrough();

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
  },
  {
    field: 'descendants',
    type: 'manyOf',
    target: 'programYearObjective',
  },
  {
    field: 'courseObjectives',
    type: 'manyOf',
    target: 'courseObjective',
  },
];
