import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import RSVP, { filter } from 'rsvp';
const { map } = RSVP;

export default Model.extend({
  title: attr('string'),
  templatePrefix: attr('string'),
  iliosAdministratorEmail: attr('string'),
  changeAlertRecipients: attr('string'),
  competencies: hasMany('competencies', { async: true }),
  courses: hasMany('course', { async: true }),
  programs: hasMany('program', { async: true }),
  vocabularies: hasMany('vocabulary', { async: true }),
  instructorGroups: hasMany('instructor-group', { async: true }),
  curriculumInventoryInstitution: belongsTo(
    'curriculum-inventory-institution',
    { async: true }
  ),
  sessionTypes: hasMany('session-type', { async: true }),
  directors: hasMany('user', { async: true, inverse: 'directedSchools' }),
  administrators: hasMany('user', {
    async: true,
    inverse: 'administeredSchools',
  }),
  configurations: hasMany('school-config', { async: true }),

  cohorts: computed('id', 'programs.@each.programYears', 'store', {
    get() {
      return this.store.query('cohort', {
        filters: {
          schools: [this.id],
        },
      });
    },
  }).readOnly(),

  async getCohortsForYear(year) {
    const cohorts = await this.cohorts;
    const cohortsForYear = await filter(cohorts.toArray(), async (cohort) => {
      const programYear = await cohort.get('programYear');
      const classOfYear = await programYear.get('classOfYear');
      const start = parseInt(programYear.get('startYear'), 10);
      const end = parseInt(classOfYear, 10);
      return parseInt(year, 10) >= start && parseInt(year, 10) <= end;
    });
    return cohortsForYear;
  },

  /**
   * Get all program years starting in the given year.
   * @method getProgramYearsForYear
   * @param {Number} year
   * @return {Promise.<Array>}
   */
  async getProgramYearsForYear(year) {
    const programs = await this.programs;
    const rhett = await map(programs.mapBy('programYears'), (programYears) => {
      return programYears.filter((programYear) => {
        return parseInt(programYear.get('startYear'), 10) === year;
      });
    });
    return rhett.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, []);
  },

  async getConfigByName(name) {
    const configs = await this.configurations;
    const config = configs.findBy('name', name);

    return isEmpty(config) ? null : config;
  },

  async getConfigValue(name) {
    const config = await this.getConfigByName(name);
    if (!config) {
      return null;
    }

    return config.parsedValue;
  },

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
  },

  async createConfig(name) {
    const store = this.store;
    const config = store.createRecord('school-config', {
      school: this,
      name,
    });
    const configurations = await this.configurations;
    configurations.pushObject(config);

    return config;
  },
});
