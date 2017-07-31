import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Promise, all, map } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  titleToken: 'general.coursesAndSessions',
  afterModel(course){
    return all([
      this.loadCourseLearningMaterials(course),
      this.loadSessionLearningMaterials(course),
    ]);

  },
  loadCourseLearningMaterials(course){
    return new Promise(resolve => {
      course.get('learningMaterials').then(courseLearningMaterials => {
        all(courseLearningMaterials.getEach('learningMaterial')).then(()=> {
          resolve();
        });
      });
    });
  },
  loadSessionLearningMaterials(course){
    return new Promise(resolve => {
      course.get('sessions').then(sessions => {
        map(sessions.toArray(), session => {
          return all([
            session.get('learningMaterials'),
            session.get('firstOfferingDate')
          ]);
        }).then(()=>{
          resolve();
        });
      });
    });
  }
});
