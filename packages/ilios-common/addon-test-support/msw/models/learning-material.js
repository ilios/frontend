import { z } from 'zod';

export const schema = z
  .object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    originalAuthor: z.string().optional(),
    citation: z.string().optional(),
    copyrightPermission: z.boolean().optional(),
    copyrightRationale: z.string().optional(),
    filename: z.string().optional(),
    mimetype: z.string().optional(),
    filesize: z.number().optional(),
    link: z.string().optional(),
    token: z.string().optional(),
  })
  .passthrough();

export const relationships = [
  {
    field: 'userRole',
    type: 'oneOf',
    target: 'learningMaterialUserRole',
  },
  {
    field: 'status',
    type: 'oneOf',
    target: 'learningMaterialStatus',
  },
  {
    field: 'owningUser',
    type: 'oneOf',
    target: 'user',
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
];
