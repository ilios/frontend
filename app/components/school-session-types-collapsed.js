import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  school: null,
  tagName: 'section',
  classNames: ['school-session-types-collapsed'],
  sessionTypes: computed('school.sessionTypes.[]', async function(){
    const school = this.get('school');
    if (!school) {
      return [];
    }
    return await school.get('sessionTypes');
  }),
  instructionalMethods: computed('sessionTypes.[]', async function(){
    const sessionTypes = await this.get('sessionTypes');

    return sessionTypes.filterBy('assessment', false);
  }),
  assessmentMethods: computed('sessionTypes.[]', async function(){
    const sessionTypes = await this.get('sessionTypes');

    return sessionTypes.filterBy('assessment');
  }),
});
