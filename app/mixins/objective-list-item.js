import Mixin from '@ember/object/mixin';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';

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

  actions: {
    async saveTitleChanges() {
      this.send('addErrorDisplayFor', 'title');
      const title = this.get('title');
      const objective = this.get('objective');

      const { validations } = await this.validate();
      if (validations.get('isInvalid')) {
        return;
      }

      objective.set('title', title);
      await objective.save();
      this.send('removeErrorDisplayFor', 'title');
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
