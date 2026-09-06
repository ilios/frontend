import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { deprecate } from '@ember/debug';

export default class School extends Model {
  @attr('string')
  title;
  @attr('string')
  templatePrefix;
  @attr('string')
  iliosAdministratorEmail;
  @attr('string')
  changeAlertRecipients;
  @hasMany('competency', { async: true, inverse: 'school' })
  competencies;
  @hasMany('course', { async: true, inverse: 'school' })
  courses;
  @hasMany('program', { async: true, inverse: 'school' })
  programs;
  @hasMany('vocabulary', { async: true, inverse: 'school' })
  vocabularies;
  @hasMany('instructor-group', { async: true, inverse: 'school' })
  instructorGroups;
  @belongsTo('curriculum-inventory-institution', { async: true, inverse: 'school' })
  curriculumInventoryInstitution;
  @hasMany('session-type', { async: true, inverse: 'school' })
  sessionTypes;
  @hasMany('user', { async: true, inverse: 'directedSchools' })
  directors;
  @hasMany('user', { async: true, inverse: 'administeredSchools' })
  administrators;
  @hasMany('school-config', { async: true, inverse: 'school' })
  configurations;

  get cohorts() {
    deprecate(`school.cohorts is called, don't use this.`, false, {
      id: 'common.school-cohorts',
      for: 'ilios-common',
      until: '63',
      since: '62.0.1',
    });
    return this.store.query('cohort', {
      filters: {
        schools: [this.id],
      },
    });
  }
}
