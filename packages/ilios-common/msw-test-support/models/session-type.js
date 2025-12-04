import { primaryKey, oneOf, manyOf } from '@mswjs/data';

let idCounter = 1;

export default {
  id: primaryKey(() => String(idCounter++)),
  title: String,
  calendarColor: String,
  active: Boolean,
  assessmentOption: oneOf('assessmentOption'),
  school: oneOf('school'),
  aamcMethods: manyOf('aamcMethod'),
  sessions: manyOf('session'),
};
