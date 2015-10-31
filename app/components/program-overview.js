import Ember from 'ember';

const { Component, computed, inject } = Ember;
const { service } = inject;

export default Component.extend({
  classNames: ['program-overview'],

  store: service(),

  program: null,

  durationOptions: computed({
    get() {
      const arr = [];

      for (let i = 1; i <= 10; i++) {
        arr.pushObject(Ember.Object.create({
          id: i,
          title: i
        }));
      }

      return arr;
    }
  }),

  shortTitleValidations: {
    'validationBuffer': {
      length: { minimum: 2, maximum: 10 }
    }
  },

  actions: {
    changeShortTitle(value) {
      const program = this.get('program');

      program.set('shortTitle', value);
      program.save();
    },
    changeDuration(value){
      const program = this.get('program');

      // If duration isn't changed it means the default of 1 was selected
      value = value == null ? 1 : value;

      program.set('duration', value);
      program.save();
    },
  }
});
