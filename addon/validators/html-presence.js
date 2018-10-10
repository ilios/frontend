import { isEmpty } from '@ember/utils';
import BaseValidator from 'ember-cp-validations/validators/base';

export default BaseValidator.extend({
  validate(value, options) {
    let text = value || '';
    let noTagsText = text.replace(/(<([^>]+)>)/ig,"");
    let strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");
    if (isEmpty(strippedText)) {
      return this.createErrorMessage('blank', value, options);
    }

    return true;
  }
});
