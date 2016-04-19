import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: {
    isEditing: 'edit',
  },
  isEditing: false,
});
