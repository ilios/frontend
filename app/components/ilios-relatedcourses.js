import Ember from 'ember';

export default Ember.Component.extend({
  filter: '',
  courses: Ember.A(),
  filteredCourses: function(){
    var filter = this.get('filter');
    var exp = new RegExp(filter, 'gi');
    var courses = this.get('courses');

    var filtered = courses.filter(function(course) {
      return course.get('title').match(exp);
    });
    return filtered.sortBy('title');
  }.property('courses.@each', 'filter'),
});
