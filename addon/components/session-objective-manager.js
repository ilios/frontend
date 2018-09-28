/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import ObjectProxy from '@ember/object/proxy';
import layout from '../templates/components/session-objective-manager';

const objectiveProxy = ObjectProxy.extend({
  sessionObjective: null,
  selected: computed('content', 'sessionObjective.parents.[]', function(){
    return this.get('sessionObjective.parents').includes(this.get('content'));
  }),
});

export default Component.extend({
  layout,
  classNames: ['objective-manager'],
  sessionObjective: null,
  'data-test-session-objective-manager': true,
  course: computed('sessionObjective.courses.[]', async function(){
    const sessionObjective = this.get('sessionObjective');
    if(!sessionObjective){
      return null;
    }
    const sessions = await sessionObjective.get('sessions');
    const session =  sessions.get('firstObject');
    return (await session.get('course'));
  }),

  proxiedObjectives: computed('course', 'course.sortedObjectives.[]', async function(){
    const sessionObjective = this.get('sessionObjective');
    if(!sessionObjective){
      return [];
    }
    const course = await this.get('course');
    if(! course){
      return [];
    }
    const objectives = await course.get('sortedObjectives');
    return objectives.map(objective => {
      return objectiveProxy.create({
        content: objective,
        sessionObjective: sessionObjective,
      });
    });
  }),

  showObjectiveList: computed('proxiedObjectives.[]', async function() {
    const objectives = await this.get('proxiedObjectives');
    return (objectives.length > 0);
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
