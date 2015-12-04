import Ember from 'ember';
import DS from 'ember-data';
import { pluralize } from 'ember-inflector';

const { inject, Service, RSVP, computed } = Ember;
const { PromiseArray } = DS;
const { service } = inject;

export default Service.extend({
  store: service(),
  currentUser: service(),
  reportsList: computed('currentUser.model.reports.[]', function(){
    let defer = RSVP.defer();
    this.get('currentUser').get('model').then( user => {
      user.get('reports').then( reports => {
        defer.resolve(reports);
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  getResults(report){
    const subject = report.get('subject');
    const object = report.get('prepositionalObject');
    const objectId = report.get('prepositionalObjectTableRowId');
    let defer = RSVP.defer();
    this.get('store').query(
      this.getModel(subject),
      this.getQuery(subject, object, objectId)
    ).then(results => {
      let mapper = subject + 'Results';
      this[mapper](results).then(mappedResults => {
        defer.resolve(mappedResults.sortBy('value'));
      });
    });
    
    return DS.PromiseArray.create({
      promise: defer.promise
    });
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
  getQuery(subject, object, objectId){
    let query = {
      limit: 1000
    };
    
    if(object && objectId){
      let what = pluralize(object.camelize());
      if(object === 'mesh term'){
        what = 'meshDescriptors';
      }
      if(subject = 'session' && object === 'session type'){
        what = 'sessionType';
      }
      query.filters = {};
      query.filters[what] = objectId;
    }
    
    return query;
  },
  courseResults(results){
    const canViewCourses = this.get('currentUser.canViewCourses');
    let map = results.map(course => {
      let rhett = {};
      rhett.value = course.get('academicYear') + ' ' + course.get('title');
      if(canViewCourses){
        rhett.route = 'course';
        rhett.model = course;
      }
      
      return rhett;
    });
    
    return RSVP.resolve(map);
  },
  sessionResults(results){
    const canView = this.get('currentUser.canViewCourses');
    let map = results.map(item => {
      return new RSVP.Promise(resolve => {
        let rhett = {};
        item.get('course').then(course => {
          rhett.value = course.get('academicYear') + ' ' + course.get('title') + ' ' + item.get('title');
          if(canView){
              rhett.route = 'session';
              rhett.model = course;
              rhett.model2 = item;
          }
          resolve(rhett);
        });
      });
    });
    
    return RSVP.all(map);
  }
});

/*
{value: 'course', label: this.get('i18n').t('general.courses')},
{value: 'session', label: this.get('i18n').t('general.sessions')},
{value: 'program', label: this.get('i18n').t('general.programs')},
{value: 'program year', label: this.get('i18n').t('general.programYears')},
{value: 'instructor', label: this.get('i18n').t('general.instructors')},
{value: 'instructor group', label: this.get('i18n').t('general.instructorGroups')},
{value: 'learning material', label: this.get('i18n').t('general.learningMaterials')},
{value: 'competency', label: this.get('i18n').t('general.competencies')},
{value: 'topic', label: this.get('i18n').t('general.topics')},
{value: 'mesh term', label: this.get('i18n').t('general.meshTerms')},
{value: 'session type', label: this.get('i18n').t('general.sessionTypes')},
 */
