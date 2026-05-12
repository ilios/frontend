import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  position: z.number().nullish(),
  active: z.boolean().nullish(),
});

export const relationships = [
  {
    field: 'session',
    type: 'oneOf',
    target: 'session',
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
    target: 'sessionObjective',
  },
  {
    field: 'descendants',
    type: 'manyOf',
    target: 'sessionObjective',
  },
  {
    field: 'courseObjectives',
    type: 'manyOf',
    target: 'courseObjective',
  },
];
