import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().optional(),
    attireRequired: z.boolean().optional(),
    equipmentRequired: z.boolean().optional(),
    supplemental: z.boolean().optional(),
    attendanceRequired: z.boolean().optional(),
    publishedAsTbd: z.boolean().optional(),
    published: z.boolean().optional(),
    instructionalNotes: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

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
  },
  {
    field: 'prerequisites',
    type: 'manyOf',
    target: 'session',
  },
  {
    field: 'terms',
    type: 'manyOf',
    target: 'term',
  },
];
