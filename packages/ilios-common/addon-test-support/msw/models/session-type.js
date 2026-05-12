import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  calendarColor: z.string().nullish(),
  active: z.boolean().nullish(),
});

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
