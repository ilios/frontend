import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 60
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  store: service(),

  classNames: ['instructorgroup-header'],

  canUpdate: false,
  title: null,

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('title', this.get('instructorGroup.title'));
  },

  actions: {
    changeTitle() {
      const group = this.instructorGroup;
      const newTitle = this.title;
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

    revertTitleChanges() {
      const group = this.instructorGroup;
      this.set('title', group.get('title'));
    }
  }
});
