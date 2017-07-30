import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, RSVP } = Ember;
const { Promise } = RSVP;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 60,
      descriptionKey: 'general.title'
    }),
  ]
});

export default Component.extend(ValidationErrorDisplay, Validations, {
  flashMessages: Ember.inject.service(),

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('title', this.get('school.title'));
  },
  classNames: ['school-manager' ],
  tagName: 'section',
  school: null,
  title: null,

  actions: {
    changeTitle() {
      const school = this.get('school');
      const newTitle = this.get('title');
      this.send('addErrorDisplayFor', 'title');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('clearErrorDisplay');
            school.set('title', newTitle);
            school.save().then((newSchool) => {
              this.set('title', newSchool.get('title'));
              this.set('school', newSchool);
              this.get('flashMessages').success('general.savedSuccessfully');
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertTitleChanges(){
      const school = this.get('school');
      this.set('title', school.get('title'));
    },
  }
});
