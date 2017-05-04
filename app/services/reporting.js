import Ember from 'ember';
import { singularize, pluralize } from 'ember-inflector';

const { inject, Service, RSVP, computed, isEmpty } = Ember;
const { service } = inject;
const { all, Promise, resolve, map } = RSVP;

export default Service.extend({
  store: service(),
  currentUser: service(),
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
  getResults(report){
    return new Promise(resolve => {
      const subject = report.get('subject');
      const object = report.get('prepositionalObject');
      const objectId = report.get('prepositionalObjectTableRowId');
      report.get('school').then(school => {
        this.get('store').query(
          this.getModel(subject),
          this.getQuery(subject, object, objectId, school)
        ).then(results => {
          let mapper = pluralize(subject.camelize()) + 'Results';
          this[mapper](results).then(mappedResults => {
            resolve(mappedResults.sortBy('value'));
          });
        });
      });
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
  getQuery(subject, object, objectId, school){
    let query = {
      filters: {}
    };

    /**
     * EXTRAWURST!
     * For reports targeting users and MeSH terms as their primary subjects,
     * explicitly do not limit on the returned result record.
     * Otherwise, unintentional truncation will occur due to query construction on the server side.
     * [ST 2016/03/31]
     */
    if (subject === 'instructor' || subject === 'mesh term') {
      query.limit = 0;
    } else {
      query.limit = 1000;
    }

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
  coursesResults(results){
    const canViewCourses = this.get('currentUser.canViewCourses');
    let mappedResults = results.map(course => {
      let rhett = {};
      rhett.value = course.get('academicYear') + ' ' + course.get('title');
      if(canViewCourses){
        rhett.route = 'course';
        rhett.model = course;
      }

      return rhett;
    });

    return resolve(mappedResults);
  },
  sessionsResults(results){
    const canView = this.get('currentUser.canViewCourses');
    let mappedResults = results.map(item => {
      return new Promise(resolve => {
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

    return all(mappedResults);
  },
  programsResults(results){
    const canView = this.get('currentUser.canViewPrograms');
    let mappedResults = results.map(item => {
      return new Promise(resolve => {
        let rhett = {};
        item.get('school').then(school => {
          rhett.value = school.get('title') + ': ' + item.get('title');
          if(canView){
            rhett.route = 'program';
            rhett.model = item;
          }
          resolve(rhett);
        });
      });
    });

    return all(mappedResults);
  },
  programYearsResults(results){
    const canView = this.get('currentUser.canViewPrograms');
    let mappedResults = results.map(item => {
      return new Promise(resolve => {
        let rhett = {};
        item.get('program').then(program => {
          program.get('school').then(school => {
            rhett.value = school.get('title') + ' ' + program.get('title') + ' ' + item.get('classOfYear');
            if(canView){
              rhett.route = 'programYear';
              rhett.model = program;
              rhett.model2 = item;
            }
            resolve(rhett);
          });
        });

      });
    });

    return all(mappedResults);
  },
  instructorsResults(results){
    let mappedResults = results.map( result => {
      return {
        value: result.get('fullName')
      };
    });
    return resolve(mappedResults);
  },
  titleResults(results){
    let mappedResults = results.map( result => {
      return {
        value: result.get('title')
      };
    });
    return resolve(mappedResults);
  },
  instructorGroupsResults(results){
    return this.titleResults(results);
  },
  learningMaterialsResults(results){
    return this.titleResults(results);
  },
  competenciesResults(results){
    return this.titleResults(results);
  },
  sessionTypesResults(results){
    return this.titleResults(results);
  },
  meshTermsResults(results){
    let mappedResults = results.map( result => {
      return {
        value: result.get('name')
      };
    });
    return resolve(mappedResults);
  },
  termsResults(results){
    return map(results.toArray(), result => {
      return new Promise(resolve => {
        result.get('vocabulary').then(vocabulary => {
          result.get('titleWithParentTitles').then(titleWithParentTitles => {
            const title = vocabulary.get('title') + ' > ' + titleWithParentTitles;
            resolve({value: title});
          });
        });
      });
    });
  },
});
