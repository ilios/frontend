import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  competencies: hasMany('competency', { inverse: 'school' }),
  courses: hasMany('course', { inverse: 'school' }),
  programs: hasMany('program', { inverse: 'school' }),
  vocabularies: hasMany('vocabulary', { inverse: 'school' }),
  instructorGroups: hasMany('instructor-group', { inverse: 'school' }),
  institutionalInformation: belongsTo('curriculum-inventory-institution', {
    inverse: 'school',
  }),
  sessionTypes: hasMany('session-type', { inverse: 'school' }),
  directors: hasMany('user', { inverse: 'directedSchools' }),
  administrators: hasMany('user', { inverse: 'administeredSchools' }),
  configurations: hasMany('school-config', { inverse: 'school' }),
});
