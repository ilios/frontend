/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import RSVP from 'rsvp';
const { Promise } = RSVP;

const objectiveProxy = ObjectProxy.extend({
  sessionObjective: null,
  selected: computed('content', 'sessionObjective.parents.[]', function(){
    return this.get('sessionObjective.parents').includes(this.get('content'));
  }),
});

export default Component.extend({
  classNames: ['objective-manager'],
  sessionObjective: null,
  'data-test-session-objective-manager': true,
  course: computed('sessionObjective.courses.[]', function(){
    return new Promise(resolve => {
      let sessionObjective = this.get('sessionObjective');
      if(!sessionObjective){
        resolve(null);
        return;
      }
      sessionObjective.get('sessions').then(function(sessions){
        let session =  sessions.get('firstObject');
        session.get('course').then(function(course){
          resolve(course);
        });
      });
    });
  }),

  proxiedObjectives: computed('course', 'course.sortedObjectives.[]', function(){
    return new Promise(resolve => {
      let sessionObjective = this.get('sessionObjective');
      if(!sessionObjective){
        resolve([]);
        return;
      }
      this.get('course').then(course => {
        if(!course){
          resolve([]);
          return;
        }
        course.get('sortedObjectives').then(objectives => {
          let objectiveProxies = objectives.map(objective => {
            return objectiveProxy.create({
              content: objective,
              sessionObjective: sessionObjective,
            });
          });
          resolve(objectiveProxies);
        });
      });
    });
  }),

  showObjectiveList: computed('proxiedObjectives.[]', function() {
    return new Promise(resolve => {
      this.get('proxiedObjectives').then(objectives => {
        resolve(objectives.length > 0);
      });
    });
  }),

  actions: {
    addParent(parentProxy) {
      let newParent = parentProxy.get('content');
      let sessionObjective = this.get('sessionObjective');
      sessionObjective.get('parents').addObject(newParent);
      newParent.get('children').addObject(sessionObjective);
    },
    removeParent(parentProxy) {
      let removingParent = parentProxy.get('content');
      let sessionObjective = this.get('sessionObjective');
      sessionObjective.get('parents').removeObject(removingParent);
      removingParent.get('children').removeObject(sessionObjective);
    }
  }
});
