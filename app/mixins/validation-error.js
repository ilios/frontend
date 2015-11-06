import Ember from 'ember';

const { computed, Mixin } = Ember;

export default Mixin.create({
  topErrorMessage: computed('errors.validationBuffer.[]', 'displayError', function() {
    if (this.get('displayError')) {
      return this.get('errors.validationBuffer')[0];
    }
  }),

  displayError: false,

  actions: {
    displayError() {
      this.set('displayError', true);
    }
  }
});
