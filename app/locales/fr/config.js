/**
* For some reason ember-i18n think FR has a 'zero' pluralization
* but it does not so we shouldn't use one.
**/
export default {
  pluralForm: function frenchWithoutZero(n) {
    if (n === 1) { return 'one'; }
    return 'other';
  }
};
