import Ember from 'ember';
import BaseValidator from 'ember-cp-validations/validators/base';

const { isEmpty, RSVP } = Ember;
const { Promise } = RSVP;

export default BaseValidator.extend({
  validate(value, options) {
    let promise = options['in'];
    if (isEmpty(promise)) {
      return true;
    }

    return new Promise(resolve => {
      promise.then(excluded => {
        if (excluded.contains(value)) {
          resolve(this.createErrorMessage('exclusion', value, options));
        } else {
          resolve(true);
        }
      });
    });
  }
});
