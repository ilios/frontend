import Component from '@ember/component';
import { action } from '@ember/object';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('html-presence', true),
    validator('length', {
      min: 3,
      max: 65000
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  tagName: 'section',
  classNames: ['new-objective'],

  title: null,
  isSaving: false,

  @action
  async saveObjective() {
    this.set('isSaving', true);
    this.send('addErrorDisplayFor', 'title');
    const { validations } = await this.validate();
    if (validations.isValid) {
      this.send('removeErrorDisplayFor', 'title');
      await this.save(this.title);
      this.set('title', null);
    }
    this.set('isSaving', false);
  },

  @action
  changeTitle(contents){
    this.send('addErrorDisplayFor', 'title');
    this.set('title', contents);
  },
});
