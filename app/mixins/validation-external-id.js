import Ember from 'ember';

const { computed, Mixin } = Ember;

export default Mixin.create({
  topErrorMessage: computed('errors.buffer.[]', function() {
    return this.get('errors.buffer')[0];
  }),

  validations: {
    'buffer': {
      presence: true,
      length: { minimum: 5 },
      numericality: true
    }
  }
});
