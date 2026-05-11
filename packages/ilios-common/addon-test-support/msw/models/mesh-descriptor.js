import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    name: z.string().nullish(),
    annotation: z.string().nullish(),
    deleted: z.boolean().nullish(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'courses',
    type: 'manyOf',
    target: 'course',
  },
  {
    field: 'sessions',
    type: 'manyOf',
    target: 'session',
  },
  {
    field: 'concepts',
    type: 'manyOf',
    target: 'meshConcept',
  },
  {
    field: 'qualifiers',
    type: 'manyOf',
    target: 'meshQualifier',
  },
  {
    field: 'trees',
    type: 'manyOf',
    target: 'meshTree',
  },
  {
    field: 'sessionLearningMaterials',
    type: 'manyOf',
    target: 'sessionLearningMaterial',
  },
  {
    field: 'courseLearningMaterials',
    type: 'manyOf',
    target: 'courseLearningMaterial',
  },
  {
    field: 'previousIndexing',
    type: 'oneOf',
    target: 'meshPreviousIndexing',
  },
  {
    field: 'sessionObjectives',
    type: 'manyOf',
    target: 'sessionObjective',
  },
  {
    field: 'courseObjectives',
    type: 'manyOf',
    target: 'courseObjective',
  },
  {
    field: 'programYearObjectives',
    type: 'manyOf',
    target: 'programYearObjective',
  },
];
