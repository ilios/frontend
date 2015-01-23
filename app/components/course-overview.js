import Ember from 'ember';

export default Ember.Component.extend({
  directorsSort: ['lastName', 'firstName'],
  sortedDirectors: Ember.computed.sort('course.directors', 'directorsSort'),
});
