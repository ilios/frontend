import { z } from 'zod';

export const schema = z
  .object({
    id: z.number(),
    title: z.string().nullish(),
    level: z.number().nullish(),
    year: z.number().nullish(),
    startDate: z.string().nullish(),
    endDate: z.string().nullish(),
    externalId: z.string().nullish(),
    locked: z.boolean().nullish(),
    archived: z.boolean().nullish(),
    publishedAsTbd: z.boolean().nullish(),
    published: z.boolean().nullish(),
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
