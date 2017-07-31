import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import Publishable from 'ilios/mixins/publishable';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { alias } = computed;
const { Promise } = RSVP;

const Validations = buildValidations({
  programTitle: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    }),
  ],
});

export default Component.extend(Validations, Publishable, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('programTitle', this.get('program.title'));
  },
  classNames: ['program-header'],
  program: null,
  programTitle: null,
  publishTarget: alias('program'),

  actions: {
    changeTitle() {
      const program = this.get('program');
      const newTitle = this.get('programTitle');
      this.send('addErrorDisplayFor', 'programTitle');
      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            this.send('removeErrorDisplayFor', 'programTitle');
            program.set('title', newTitle);
            program.save().then((newprogram) => {
              this.set('programTitle', newprogram.get('title'));
              this.set('program', newprogram);
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertTitleChanges(){
      const program = this.get('program');
      this.set('programTitle', program.get('title'));
    },
  }
});
