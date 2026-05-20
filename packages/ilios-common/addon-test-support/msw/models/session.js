import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  attireRequired: z.boolean().nullish(),
  equipmentRequired: z.boolean().nullish(),
  supplemental: z.boolean().nullish(),
  attendanceRequired: z.boolean().nullish(),
  publishedAsTbd: z.boolean().nullish(),
  published: z.boolean().nullish(),
  description: z.string().nullish(),
  instructionalNotes: z.string().nullish(),
  updatedAt: z.iso.datetime({ offset: true }).nullish(),
});

export const relationships = [
  {
    field: 'sessionType',
    type: 'oneOf',
    target: 'sessionType',
  },
  {
    field: 'course',
    type: 'oneOf',
    target: 'course',
  },
  {
    field: 'ilmSession',
    type: 'oneOf',
    target: 'ilmSession',
  },
  {
    field: 'sessionObjectives',
    type: 'manyOf',
    target: 'sessionObjective',
  },
  {
    field: 'meshDescriptors',
    type: 'manyOf',
    target: 'meshDescriptor',
  },
  {
    field: 'learningMaterials',
    type: 'manyOf',
    target: 'sessionLearningMaterial',
  },
  {
    field: 'offerings',
    type: 'manyOf',
    target: 'offering',
  },
  {
    field: 'administrators',
    type: 'manyOf',
    target: 'user',
    role: 'sessionAdministrator',
  },
  {
    field: 'studentAdvisors',
    type: 'manyOf',
    target: 'user',
    role: 'sessionStudentAdvisor',
  },
  {
    field: 'postrequisite',
    type: 'oneOf',
    target: 'session',
    role: 'prerequisites',
  },
  {
    field: 'prerequisites',
    type: 'manyOf',
    target: 'session',
    role: 'prerequisites',
  },
  {
    field: 'terms',
    type: 'manyOf',
    target: 'term',
  },
];
