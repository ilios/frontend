import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
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

  tagName: "",

  canUpdate: false,
  title: null,

  didReceiveAttrs() {
    this._super(...arguments);
    this.set('title', this.get('instructorGroup.title'));
  },

  actions: {
    async changeTitle() {
      const group = this.instructorGroup;
      const newTitle = this.title;
      this.send('addErrorDisplayFor', 'title');
      const { validations } = await this.validate();

      if (validations.isValid) {
        this.send('removeErrorDisplayFor', 'title');
        group.set('title', newTitle);
        const newGroup = await group.save();
        this.set('title', newGroup.title);
        this.set('instructorGroup', newGroup);
      } else {
        await reject();
      }
    },

    revertTitleChanges() {
      const group = this.instructorGroup;
      this.set('title', group.get('title'));
    }
  }
});
