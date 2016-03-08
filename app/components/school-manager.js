import Ember from 'ember';

const { Component, inject } = Ember;
const { service } = inject;

export default Component.extend({
  flashMessages: service(),
  classNames: [ 'full-width', 'school-manager' ],
  tagName: 'section',
  school: null,
  titleValidations: {
    'validationBuffer': {
      presence: true,
      length: { maximum: 60 }
    }
  },

  actions: {
    changeTitle(newTitle) {
      const school = this.get('school');

      school.set('title', newTitle);
      school.save().then(()=>{
        this.get('flashMessages').success('general.savedSuccessfully');
      });
    }
  }
});
