import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';

const { Component, computed } = Ember;
const { alias, not } = computed;

export default Component.extend(Publishable, {
  course: null,

  publishTarget: alias('course'),

  editable: not('course.locked'),

  titleValidations: {
    'validationBuffer': {
      presence: true,
      length: { minimum: 3, maximum: 200 }
    }
  },

  actions: {
    changeTitle(newTitle) {
      const course = this.get('course');

      course.set('title', newTitle);
      course.save();
    }
  }
});
