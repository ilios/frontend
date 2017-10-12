import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import BaseValidator from 'ember-cp-validations/validators/base';

const { Promise } = RSVP;

export default BaseValidator.extend({
  validate(value, options) {
    let promise = options['in'];
    if (isEmpty(promise)) {
      return true;
    }

    return new Promise(resolve => {
      promise.then(excluded => {
        if (excluded.includes(value)) {
          resolve(this.createErrorMessage('exclusion', value, options));
        } else {
          resolve(true);
        }
      });
    });
  }
});
