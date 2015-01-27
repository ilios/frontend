import Ember from 'ember';
import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  pathForType: function(type) {
    return Ember.String.pluralize(type.toLowerCase());
  }

});
