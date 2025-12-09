import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    position: z.number().optional(),
    active: z.boolean().optional(),
  })
  .passthrough();

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
