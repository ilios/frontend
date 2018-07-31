import Mixin from '@ember/object/mixin';
import RSVP from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

const { Promise } = RSVP;

const Validations = buildValidations({
  title: [
    validator('html-presence', true),
    validator('length', {
      min: 3,
      max: 65000
    }),
  ]
});

export default Mixin.create(ValidationErrorDisplay, Validations, {

  didReceiveAttrs(){
    this._super(...arguments);
    this.set('title', this.get('objective').get('title'));
  },
  tagName: 'tr',
  classNameBindings: ['showRemoveConfirmation:confirm-removal'],

  objective: null,
  title: null,
  isSaving: false,
  showRemoveConfirmation: false,
  editable: true,

  actions: {
    saveTitleChanges() {
      this.send('addErrorDisplayFor', 'title');
      const title = this.get('title');
      const objective = this.get('objective');

      return new Promise((resolve, reject) => {
        this.validate().then(({validations}) => {
          if (validations.get('isValid')) {
            objective.set('title', title);
            objective.save().then(()=> {
              this.send('removeErrorDisplayFor', 'title');
              resolve();
            });
          } else {
            reject();
          }
        });
      });
    },
    revertTitleChanges() {
      const objective = this.get('objective');
      this.set('title', objective.get('title'));
    },
    changeTitle(contents){
      this.send('addErrorDisplayFor', 'title');
      this.set('title', contents);
    },
  }
});
