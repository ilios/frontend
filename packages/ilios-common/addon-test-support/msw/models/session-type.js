import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    calendarColor: z.string().optional(),
    active: z.boolean().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'assessmentOption',
    type: 'oneOf',
    target: 'assessmentOption',
  },
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
  {
    field: 'aamcMethods',
    type: 'manyOf',
    target: 'aamcMethod',
  },
  {
    field: 'sessions',
    type: 'manyOf',
    target: 'session',
  },
];
