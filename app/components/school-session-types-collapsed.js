import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  tagName: "",
  school: null,

  sessionTypes: computed('school.sessionTypes.[]', async function() {
    const school = this.school;
    if (!school) {
      return [];
    }
    return await school.get('sessionTypes');
  }),

  instructionalMethods: computed('sessionTypes.[]', async function() {
    const sessionTypes = await this.sessionTypes;
    return sessionTypes.filterBy('assessment', false);
  }),

  assessmentMethods: computed('sessionTypes.[]', async function() {
    const sessionTypes = await this.sessionTypes;
    return sessionTypes.filterBy('assessment');
  })
});
