import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    notes: z.string().nullish(),
    required: z.boolean().nullish(),
    publicNotes: z.boolean().nullish(),
    position: z.number().nullish(),
    startDate: z.string().nullish(),
    endDate: z.string().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'course',
    type: 'oneOf',
    target: 'course',
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
