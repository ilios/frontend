import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
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
