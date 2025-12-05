import { primaryKey, oneOf, manyOf } from '@msw/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  templatePrefix: String,
  iliosAdministratorEmail: String,
  changeAlertRecipients: String,
  competencies: manyOf('competency'),
  courses: manyOf('course'),
  programs: manyOf('program'),
  vocabularies: manyOf('vocabulary'),
  instructorGroups: manyOf('instructorGroup'),
  curriculumInventoryInstitution: oneOf('curriculumInventoryInstitution'),
  sessionTypes: manyOf('sessionType'),
  directors: manyOf('user'),
  administrators: manyOf('user'),
  configurations: manyOf('schoolConfig'),
};
