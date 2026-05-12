import { z } from 'zod';

export const schema = z.looseObject({
  id: z.number(),
  title: z.string().nullish(),
  description: z.string().nullish(),
  originalAuthor: z.string().nullish(),
  citation: z.string().nullish(),
  copyrightPermission: z.boolean().nullish(),
  copyrightRationale: z.string().nullish(),
  filename: z.string().nullish(),
  mimetype: z.string().nullish(),
  filesize: z.number().nullish(),
  link: z.string().nullish(),
  token: z.string().nullish(),
  absoluteFileUri: z.string().nullish(),
  markedAccessible: z.boolean().nullish(),
  uploadDate: z.date(),
});

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
