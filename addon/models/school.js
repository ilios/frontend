import DS from 'ember-data';
import Ember from 'ember';

const { attr, belongsTo, hasMany, Model } = DS;
const { computed, isEmpty, RSVP, $} = Ember;
const {  map } = RSVP;

export default Model.extend({
  title: attr('string'),
  templatePrefix: attr('string'),
  iliosAdministratorEmail: attr('string'),
  changeAlertRecipients: attr('string'),
  competencies: hasMany('competencies', {async: true}),
  courses: hasMany('course', {async: true}),
  programs: hasMany('program', {async: true}),
  departments: hasMany('department', {async: true}),
  vocabularies: hasMany('vocabulary', {async: true}),
  instructorGroups: hasMany('instructor-group', {async: true}),
  curriculumInventoryInstitution: belongsTo('curriculum-inventory-institution', {async: true}),
  sessionTypes: hasMany('session-type', {async: true}),
  stewards: hasMany('program-year-steward', {async: true}),
  directors: hasMany('user', {async: true, inverse: 'directedSchools'}),
  administrators: hasMany('user', {async: true, inverse: 'administeredSchools'}),
  configurations: hasMany('school-config', {async: true}),

  cohorts: computed('programs.@each.programYears', {
    get(){
      return this.get('store').query('cohort', {
        filters: {
          schools: [this.get('id')]
        },
      });
    }
  }).readOnly(),

  async getCohortsForYear(year){
    let cohorts = await this.get('cohorts');
    let cohortsForYear = await Ember.RSVP.filter(cohorts.toArray(), async cohort => {
      const programYear = await cohort.get('programYear');
      let start = parseInt(programYear.get('startYear'));
      let end = parseInt(programYear.get('classOfYear'));
      return (parseInt(year) >= start && parseInt(year) <= end);
    });
    return cohortsForYear;
  },

  /**
   * Get all program years starting in the given year.
   * @method getProgramYearsForYear
   * @param {Number} year
   * @return {Promise.<Array>}
   */
  async getProgramYearsForYear(year){
    const programs = await this.get('programs');
    const rhett = await map(programs.mapBy('programYears'), programYears => {
      return programYears.filter(programYear => {
        return parseInt(programYear.get('startYear'), 10) === year;
      });
    });
    return rhett.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, []);
  },

  async getConfigByName(name){
    const configs = await this.get('configurations');
    const config = configs.findBy('name', name);

    return isEmpty(config)?null:config;
  },

  async getConfigValue(name){
    const config = await this.getConfigByName(name);
    const value = isEmpty(config)?null:config.get('value');

    return $.parseJSON(value);
  },

  async setConfigValue(name, value){
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

  async createConfig(name){
    const store = this.get('store');
    const config = store.createRecord('school-config', {
      school: this,
      name
    });
    let configurations = await this.get('configurations');
    configurations.pushObject(config);

    return config;
  },
});
