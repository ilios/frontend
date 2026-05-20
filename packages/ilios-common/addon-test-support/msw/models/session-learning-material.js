import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  notes: z.string().nullish(),
  required: z.boolean().nullish(),
  publicNotes: z.boolean().nullish(),
  position: z.number().nullish(),
  startDate: z.string().nullish(),
  endDate: z.string().nullish(),
});

export const relationships = [
  {
    field: 'session',
    type: 'oneOf',
    target: 'session',
  },
  {
    field: 'learningMaterial',
    type: 'oneOf',
    target: 'learningMaterial',
  },
  {
    field: 'meshDescriptors',
    type: 'manyOf',
    target: 'meshDescriptor',
  },
];
