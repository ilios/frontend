import { isEmpty } from '@ember/utils';
import BaseValidator from 'ember-cp-validations/validators/base';

export default BaseValidator.extend({
  validate(value, options) {
    const text = value || '';
    const noTagsText = text.replace(/(<([^>]+)>)/ig,"");
    const strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");
    if (isEmpty(strippedText)) {
      return this.createErrorMessage('blank', value, options);
    }

    return true;
  }
});
