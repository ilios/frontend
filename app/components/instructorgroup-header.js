import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Component, RSVP } = Ember;
const { Promise } = RSVP;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 60
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('title', this.get('instructorGroup.title'));
  },
  store: Ember.inject.service(),
  title: null,
  classNames: ['instructorgroup-header'],
  actions: {
    changeTitle(){
      const group = this.get('instructorGroup');
      const newTitle = this.get('title');
      this.send('addErrorDisplayFor', 'title');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'title');
            group.set('title', newTitle);
            group.save().then((newGroup) => {
              this.set('title', newGroup.get('title'));
              this.set('instructorGroup', newGroup);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },

    revertTitleChanges(){
      const group = this.get('instructorGroup');
      this.set('title', group.get('title'));
    },
  }
});
