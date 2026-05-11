import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().optional(),
    level: z.number().optional(),
    year: z.number().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    externalId: z.string().optional().nullable(),
    locked: z.boolean().optional(),
    archived: z.boolean().optional(),
    publishedAsTbd: z.boolean().optional(),
    published: z.boolean().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'clerkshipType',
    type: 'oneOf',
    target: 'courseClerkshipType',
  },
  {
    field: 'school',
    type: 'oneOf',
    target: 'school',
  },
  {
    field: 'directors',
    type: 'manyOf',
    target: 'user',
    role: 'courseDirector',
  },
  {
    field: 'administrators',
    type: 'manyOf',
    target: 'user',
    role: 'courseAdministrator',
  },
  {
    field: 'studentAdvisors',
    type: 'manyOf',
    target: 'user',
    role: 'courseStudentAdvisor',
  },
  {
    field: 'cohorts',
    type: 'manyOf',
    target: 'cohort',
  },
  {
    field: 'courseObjectives',
    type: 'manyOf',
    target: 'courseObjective',
  },
  {
    field: 'meshDescriptors',
    type: 'manyOf',
    target: 'meshDescriptor',
  },
  {
    field: 'learningMaterials',
    type: 'manyOf',
    target: 'courseLearningMaterial',
  },
  {
    field: 'sessions',
    type: 'manyOf',
    target: 'session',
  },
  {
    field: 'ancestor',
    type: 'oneOf',
    target: 'course',
  },
  {
    field: 'descendants',
    type: 'manyOf',
    target: 'course',
  },
  {
    field: 'terms',
    type: 'manyOf',
    target: 'term',
  },
];
