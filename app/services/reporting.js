import Service, { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { singularize, pluralize } from 'ember-inflector';

const { all, filter, Promise, resolve, map } = RSVP;

export default Service.extend({
  store: service(),
  currentUser: service(),
  i18n: service(),
  reportsList: computed('currentUser.model.reports.[]', function(){
    return new Promise(resolve => {
      this.get('currentUser').get('model').then( user => {
        if(isEmpty(user)){
          resolve([]);
        } else {
          user.get('reports').then( reports => {
            resolve(reports);
          });
        }
      });
    });
  }),

  async findResults(report){
    const store = this.get('store');
    const subject = report.get('subject');
    const object = report.get('prepositionalObject');
    const objectId = report.get('prepositionalObjectTableRowId');
    const school = await report.get('school');

    return store.query(
      this.getModel(subject),
      this.getQuery(subject, object, objectId, school)
    );
  },
  async getResults(report, year){
    const subject = report.get('subject');

    const results = await this.findResults(report);
    let mapper = pluralize(subject.camelize()) + 'Results';
    const mappedResults = await this[mapper](results, year);

    return mappedResults.sortBy('value');
  },
  async getArrayResults(report, year){
    const subject = report.get('subject');

    const results = await this.findResults(report);
    let mapper = pluralize(subject.camelize()) + 'ArrayResults';
    return this[mapper](results, year);
  },

  getModel(subject){
    let model = subject.dasherize();
    if(model === 'instructor'){
      model = 'user';
    }
    if(model === 'mesh-term'){
      model = 'mesh-descriptor';
    }

    return model;
  },
  getQuery(subject, object, objectId, school){
    let query = {
      filters: {}
    };

    if(object && objectId){
      let what = pluralize(object.camelize());
      if(object === 'mesh term'){
        what = 'meshDescriptors';
      }

      if(subject === 'session'){
        let sessionSingulars = ['sessionTypes', 'courses'];
        if(sessionSingulars.includes(what)){
          what = singularize(what);
        }
      }
      if(subject === 'instructor'){
        let specialInstructed = ['learningMaterials', 'sessionTypes', 'courses', 'sessions'];
        if(specialInstructed.includes(what)){
          what = 'instructed' + what.capitalize();
        }
      }
      query.filters[what] = objectId;
    } else {
      if(subject !== 'mesh term' && subject !== 'instructor' && subject !== 'learning material' && school){
        query.filters['schools'] = [school.get('id')];
      }
    }

    return query;
  },
  canViewCourses: computed(
    'currentUser.userIsCourseDirector',
    'currentUser.userIsFaculty',
    'currentUser.userIsDeveloper',
    async function(){
      const currentUser = this.get('currentUser');
      const roles = await all([
        currentUser.get('userIsCourseDirector'),
        currentUser.get('userIsFaculty'),
        currentUser.get('userIsDeveloper')
      ]);

      return roles.includes(true);
    }
  ),
  canViewPrograms: computed(
    'currentUser.userIsCourseDirector',
    'currentUser.userIsDeveloper',
    async function(){
      const currentUser = this.get('currentUser');
      const roles = await all([
        currentUser.get('userIsCourseDirector'),
        currentUser.get('userIsFaculty'),
        currentUser.get('userIsDeveloper')
      ]);

      return roles.includes(true);
    }
  ),

  async coursesResults(results, year){
    const canView = await this.get('canViewCourses');
    let mappedResults = results.map(course => {
      let rhett = {
        course
      };
      rhett.value = course.get('academicYear') + ' ' + course.get('title');
      if(canView){
        rhett.route = 'course';
        rhett.model = course;
      }

      return rhett;
    });

    return mappedResults.filter(obj => isEmpty(year) || parseInt(obj.course.get('year'), 10) === parseInt(year, 10));
  },
  async coursesArrayResults(results, year) {
    const i18n = this.get('i18n');
    let filteredResults = results.filter( course => {
      const academicYear = course.get('year');
      return isEmpty(year) || parseInt(academicYear, 10) === parseInt(year, 10);
    });
    let sortedResults = filteredResults.sortBy('title');
    let mappedResults = sortedResults.map(course => {
      return [
        course.get('title'),
        course.get('academicYear'),
        course.get('externalId'),
      ];
    });

    return [[i18n.t('general.courses'), i18n.t('general.academicYear'), i18n.t('general.externalId')]].concat(mappedResults);
  },
  async sessionsResults(results, year){
    const canView = await this.get('canViewCourses');
    let mappedResults = await map(results.toArray(), async item => {
      const course = await item.get('course');
      let rhett = { course };
      rhett.value = course.get('academicYear') + ' ' + course.get('title') + ' ' + item.get('title');
      if(canView){
        rhett.route = 'session';
        rhett.model = course;
        rhett.model2 = item;
      }

      return rhett;
    });

    return mappedResults.filter(obj => isEmpty(year) || parseInt(obj.course.get('year'), 10) === parseInt(year, 10));
  },
  async sessionsArrayResults(results, year) {
    const i18n = this.get('i18n');
    let filteredResults = await filter(results.toArray(), async session => {
      const course = await session.get('course');
      const academicYear = course.get('year');
      return isEmpty(year) || parseInt(academicYear, 10) === parseInt(year, 10);
    });
    let sortedResults = filteredResults.sortBy('title');
    let mappedResults = await map(sortedResults, async session => {
      const course = await session.get('course');
      return  [session.get('title'), course.get('title'), course.get('academicYear')];
    });

    return [[i18n.t('general.session'), i18n.t('general.course'), i18n.t('general.academicYear')]].concat(mappedResults);
  },
  async programsResults(results){
    const canView = await this.get('canViewPrograms');
    const mappedResults = await map(results.toArray(), async item => {
      let rhett = {};
      const school = await item.get('school');
      rhett.value = school.get('title') + ': ' + item.get('title');
      if(canView){
        rhett.route = 'program';
        rhett.model = item;
      }
      return rhett;
    });

    return mappedResults;
  },
  async programsArrayResults(results) {
    const i18n = this.get('i18n');
    let sortedResults = results.sortBy('title');
    let mappedResults = await map(sortedResults.toArray(), async program => {
      const school = await program.get('school');
      return [
        program.get('title'),
        school.get('title'),
      ];
    });

    return [[i18n.t('general.program'), i18n.t('general.school')]].concat(mappedResults);
  },
  async programYearsResults(results){
    const canView = await this.get('canViewPrograms');
    const mappedResults = await map(results.toArray(), async item => {
      let rhett = {};
      const program = await item.get('program');
      const school = await program.get('school');
      rhett.value = school.get('title') + ' ' + program.get('title') + ' ' + item.get('classOfYear');
      if(canView){
        rhett.route = 'programYear';
        rhett.model = program;
        rhett.model2 = item;
      }
      return rhett;
    });

    return mappedResults;
  },
  async programYearsArrayResults(results) {
    const i18n = this.get('i18n');
    let sortedResults = results.sortBy('classOfYear');
    let mappedResults = await map(sortedResults.toArray(), async programYear => {
      const program = await programYear.get('program');
      const school = await program.get('school');
      return [
        programYear.get('classOfYear'),
        program.get('title'),
        school.get('title'),
      ];
    });

    return [[i18n.t('general.year'), i18n.t('general.program'), i18n.t('general.school')]].concat(mappedResults);
  },
  instructorsResults(results){
    let mappedResults = results.map( result => {
      return {
        value: result.get('fullName')
      };
    });
    return resolve(mappedResults);
  },
  async instructorsArrayResults(results) {
    const i18n = this.get('i18n');
    let arr = await this.instructorsResults(results);
    let sortedResults = arr.sortBy('value');
    let mappedResults = sortedResults.map(obj => [obj.value]);
    return [[i18n.t('general.instructors')]].concat(mappedResults);
  },
  titleResults(results){
    let mappedResults = results.map( result => {
      return {
        value: result.get('title')
      };
    });
    return resolve(mappedResults);
  },
  async valueResults(results, translationKey) {
    const i18n = this.get('i18n');
    let arr = await this.titleResults(results);
    let sortedResults = arr.sortBy('value');
    let mappedResults = sortedResults.map(obj => [obj.value]);
    return [[i18n.t(translationKey)]].concat(mappedResults);
  },
  instructorGroupsResults(results){
    return this.titleResults(results);
  },
  async instructorGroupsArrayResults(results) {
    return this.valueResults(results, 'general.instructorGroups');
  },
  learningMaterialsResults(results){
    return this.titleResults(results);
  },
  async learningMaterialsArrayResults(results) {
    return this.valueResults(results, 'general.learningMaterials');
  },
  competenciesResults(results){
    return this.titleResults(results);
  },
  async competenciesArrayResults(results) {
    return this.valueResults(results, 'general.competencies');
  },
  sessionTypesResults(results){
    return this.titleResults(results);
  },
  async sessionTypesArrayResults(results) {
    return this.valueResults(results, 'general.sessionTypes');
  },
  meshTermsResults(results){
    let mappedResults = results.map( result => {
      return {
        value: result.get('name')
      };
    });
    return resolve(mappedResults);
  },
  async meshTermsArrayResults(results) {
    const i18n = this.get('i18n');
    let arr = await this.meshTermsResults(results);
    let sortedResults = arr.sortBy('value');
    let mappedResults = sortedResults.map(obj => [obj.value]);
    return [[i18n.t('general.meshTerms')]].concat(mappedResults);
  },
  async termsResults(results){
    return map(results.toArray(), async term => {
      const vocabulary = await term.get('vocabulary');
      const titleWithParentTitles = await term.get('titleWithParentTitles');
      const value = vocabulary.get('title') + ' > ' + titleWithParentTitles;
      return {value};
    });
  },
  async termsArrayResults(results) {
    const i18n = this.get('i18n');
    let arr = await this.termsResults(results);
    let sortedResults = arr.sortBy('value');
    let mappedResults = sortedResults.map(obj => [obj.value]);
    return [[i18n.t('general.vocabulary')]].concat(mappedResults);
  },
});
