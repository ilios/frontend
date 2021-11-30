import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { isEmpty } from '@ember/utils';
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
  @hasMany('competencies', { async: true })
  competencies;
  @hasMany('course', { async: true })
  courses;
  @hasMany('program', { async: true })
  programs;
  @hasMany('vocabulary', { async: true })
  vocabularies;
  @hasMany('instructor-group', { async: true })
  instructorGroups;
  @belongsTo('curriculum-inventory-institution', { async: true })
  curriculumInventoryInstitution;
  @hasMany('session-type', { async: true })
  sessionTypes;
  @hasMany('user', { async: true, inverse: 'directedSchools' })
  directors;
  @hasMany('user', { async: true, inverse: 'administeredSchools' })
  administrators;
  @hasMany('school-config', { async: true })
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

  async getConfigByName(name) {
    const configs = await this.configurations;
    const config = configs.findBy('name', name);

    return isEmpty(config) ? null : config;
  }

  async getConfigValue(name) {
    const config = await this.getConfigByName(name);
    if (!config) {
      return null;
    }

    return config.parsedValue;
  }

  async setConfigValue(name, value) {
    const oldValue = await this.getConfigValue(name);
    if (value !== oldValue) {
      let config = await this.getConfigByName(name);
      if (isEmpty(config)) {
        config = await this.createConfig(name);
      }
      config.set('value', value);

      return config;
    }

    return false;
  }

  async createConfig(name) {
    const store = this.store;
    const config = store.createRecord('school-config', {
      school: this,
      name,
    });
    const configurations = await this.configurations;
    configurations.pushObject(config);

    return config;
  }
}
