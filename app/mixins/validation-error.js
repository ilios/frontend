import Ember from 'ember';

const { computed, Mixin } = Ember;

export default Mixin.create({
  topErrorMessage: computed('errors.validationBuffer.[]', function() {
    return this.get('errors.validationBuffer')[0];
  })
});
