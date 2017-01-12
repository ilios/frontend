import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, computed, RSVP } = Ember;
const { Promise } = RSVP;
const Validations = buildValidations({
  shortTitle: [
    validator('length', {
      min: 2,
      max: 10,
      allowBlank: true
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('shortTitle', this.get('program.shortTitle'));
    this.set('duration', this.get('program').get('duration'));
  },
  classNames: ['program-overview'],
  program: null,
  shortTitle: null,
  duration: null,

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

  actions: {
    changeShortTitle() {
      const program = this.get('program');
      const newTitle = this.get('shortTitle');
      this.send('addErrorDisplayFor', 'shortTitle');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'shortTitle');
            program.set('shortTitle', newTitle);
            program.save().then((newProgram) => {
              this.set('shortTitle', newProgram.get('shortTitle'));
              this.set('program', newProgram);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },

    revertShortTitleChanges(){
      const program = this.get('program');
      this.set('shortTitle', program.get('shortTitle'));
    },

    changeDuration(){
      const program = this.get('program');
      let duration = this.get('duration');
      // If duration isn't changed it means the default of 1 was selected
      duration = duration == null ? 1 : duration;
      program.set('duration', duration);
      program.save();
    },

    revertDurationChanges(){
      this.set('duration', this.get('program').get('duration'));
    }
  }
});
