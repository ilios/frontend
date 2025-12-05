import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  description: String,
  originalAuthor: String,
  citation: String,
  copyrightPermission: Boolean,
  copyrightRationale: String,
  filename: String,
  mimetype: String,
  filesize: Number,
  link: String,
  token: String,
  userRole: oneOf('learningMaterialUserRole'),
  status: oneOf('learningMaterialStatus'),
  owningUser: oneOf('user'),
  sessionLearningMaterials: manyOf('sessionLearningMaterial'),
  courseLearningMaterials: manyOf('courseLearningMaterial'),
};
