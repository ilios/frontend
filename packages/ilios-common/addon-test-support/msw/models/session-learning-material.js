import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    notes: z.string().optional(),
    required: z.boolean().optional(),
    publicNotes: z.boolean().optional(),
    position: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .passthrough();

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
