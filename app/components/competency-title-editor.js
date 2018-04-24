/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import RSVP from 'rsvp';
import { isPresent } from '@ember/utils';
import { validator, buildValidations } from 'ember-cp-validations';
import ValidationErrorDisplay from 'ilios/mixins/validation-error-display';
import { task } from 'ember-concurrency';

const { Promise } = RSVP;

const Validations = buildValidations({
  title: [
    validator('presence', true),
    validator('length', {
      max: 200
    }),
  ],
});

export default Component.extend(Validations, ValidationErrorDisplay, {
  didReceiveAttrs(){
    this._super(...arguments);
    const competency = this.get('competency');
    if (isPresent(competency)) {
      this.set('title', competency.get('title'));
    }
  },
  title: null,
  competency: null,
  canUpdate: false,
  classNames: ['competency-title-editor'],
  tagName: 'span',
  save: task(function * (){
    this.send('addErrorDisplayFor', 'title');
    let {validations} = yield this.validate();

    return new Promise((resolve, reject) => {
      if (validations.get('isInvalid')) {
        reject();
      } else {
        const competency = this.get('competency');
        const title = this.get('title');
        if (isPresent(competency)) {
          competency.set('title', title);
        }
        this.send('clearErrorDisplay');
        resolve();
      }
    });

  }),
  actions: {
    revert() {
      this.set('title', null);
      const competency = this.get('competency');
      if (isPresent(competency)) {
        this.set('title', competency.get('title'));
      }
    },
  }
});
