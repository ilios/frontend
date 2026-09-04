import 'zod/compile'; // must come before modules that define schemas
import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  hours: z.number(),
  dueDate: z.iso.datetime({ offset: true }),
});

export const relationships = [
  {
    field: 'session',
    type: 'oneOf',
    target: 'session',
  },
  {
    field: 'learnerGroups',
    type: 'manyOf',
    target: 'learnerGroup',
  },
  {
    field: 'instructorGroups',
    type: 'manyOf',
    target: 'instructorGroup',
  },
  {
    field: 'instructors',
    type: 'manyOf',
    target: 'user',
    role: 'ilmInstructors',
  },
  {
    field: 'learners',
    type: 'manyOf',
    target: 'user',
    role: 'ilmLearners',
  },
];
