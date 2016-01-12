import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';

const { Component, computed } = Ember;
const { alias } = computed;

export default Component.extend(Publishable, {
  program: null,

  publishTarget: alias('program'),

  titleValidations: {
    'validationBuffer': {
      presence: true,
      length: { minimum: 3, maximum: 200 }
    }
  },

  actions: {
    changeTitle(newTitle) {
      const program = this.get('program');

      program.set('title', newTitle);
      program.save();
    },
  }
});
