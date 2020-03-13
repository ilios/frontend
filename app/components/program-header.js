import Component from '@ember/component';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  programTitle: [
    validator('presence', true),
    validator('length', {
      min: 3,
      max: 200
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  tagName: "",

  canUpdate: false,
  program: null,
  programTitle: null,

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('programTitle', this.get('program.title'));
  },

  actions: {
    async changeTitle() {
      const program = this.program;
      const newTitle = this.programTitle;
      this.send('addErrorDisplayFor', 'programTitle');
      await this.validate();
      if (this.validations.get('isValid')) {
        this.send('removeErrorDisplayFor', 'programTitle');
        program.set('title', newTitle);
        const newprogram = await program.save();
        this.set('programTitle', newprogram.get('title'));
        this.set('program', newprogram);
        return true;
      }
      return false;
    },

    revertTitleChanges() {
      const program = this.program;
      this.set('programTitle', program.get('title'));
    },

    async activate() {
      const program = this.program;
      program.set('published', true);
      program.set('publishedAsTbd', false);
      await program.save();
    }
  }
});
