import Component from '@ember/component';
import { isPresent } from '@ember/utils';
import { reject } from 'rsvp';
import { task } from 'ember-concurrency';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios-common/mixins/validation-error-display';

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 200
    })
  ]
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  classNames: ['competency-title-editor'],
  tagName: 'span',

  canUpdate: false,
  competency: null,
  title: null,

  didReceiveAttrs() {
    this._super(...arguments);
    const competency = this.competency;
    if (isPresent(competency)) {
      this.set('title', competency.get('title'));
    }
  },

  actions: {
    revert() {
      this.set('title', null);
      const competency = this.competency;
      if (isPresent(competency)) {
        this.set('title', competency.get('title'));
      }
    }
  },

  save: task(function* () {
    this.send('addErrorDisplayFor', 'title');
    const { validations } = yield this.validate();

    if (validations.isValid) {
      const { competency, title } = this.getProperties('competency', 'title');

      if (isPresent(competency)) {
        competency.set('title', title);
      }

      this.send('clearErrorDisplay');
    } else {
      yield reject();
    }
  })
});
