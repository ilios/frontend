import Component from '@ember/component';
import { reject } from 'rsvp';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  shortTitle: [
    validator('length', {
      min: 2,
      max: 10,
      allowBlank: true
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  tagName: "",

  canUpdate: false,
  duration: null,
  program: null,
  shortTitle: null,

  durationOptions: null,

  init() {
    this._super(...arguments);
    this.durationOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  },

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('shortTitle', this.get('program.shortTitle'));
    this.set('duration', this.program.get('duration'));
  },

  actions: {
    async changeShortTitle() {
      const program = this.program;
      const newTitle = this.shortTitle;
      this.send('addErrorDisplayFor', 'shortTitle');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'shortTitle');
        program.set('shortTitle', newTitle);
        const newProgram = await program.save();
        this.set('shortTitle', newProgram.shortTitle);
        this.set('program', newProgram);
      } else {
        await reject();
      }
    },

    revertShortTitleChanges() {
      const program = this.program;
      this.set('shortTitle', program.get('shortTitle'));
    },

    changeDuration() {
      const program = this.program;
      let duration = this.duration;
      // If duration isn't changed it means the default of 1 was selected
      duration = duration == null ? 1 : duration;
      program.set('duration', duration);
      program.save();
    },

    revertDurationChanges() {
      this.set('duration', this.program.get('duration'));
    },

    setDuration(event) {
      this.set('duration', Number(event.target.value));
    }
  }
});
