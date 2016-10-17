import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, RSVP } = Ember;
const { Promise, all, map } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  afterModel(course){
    return all([
      this.loadCourseLearhingMaterials(course),
      this.loadSessionLearhingMaterials(course),
    ])

  },
  loadCourseLearhingMaterials(course){
    return new Promise(resolve => {
      course.get('learningMaterials').then(courseLearningMaterials => {
        all(courseLearningMaterials.getEach('learningMaterial')).then(()=> {
          resolve();
        })
      });
    });
  },
  loadSessionLearhingMaterials(course){
    return new Promise(resolve => {
      course.get('sessions').then(sessions => {
        map(sessions.toArray(), session => {
          return all([
            session.get('learningMaterials'),
            session.get('firstOfferingDate')
          ]);
        }).then(()=>{
          resolve();
        })
      });
    });
  }
});
