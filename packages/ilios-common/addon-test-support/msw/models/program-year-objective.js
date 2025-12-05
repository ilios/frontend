import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    position: z.number().optional(),
    active: z.boolean().optional(),
  })
  .passthrough();

export const relations = [
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
