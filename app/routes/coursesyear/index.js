import Ember from 'ember';

export default  Ember.Route.extend({
  model: function() {
    var yearTitle = this.modelFor('coursesyear').get('title');
    return this.modelFor('coursesschool').get('courses').then(function(courses){

      return courses.filter(function(course){
        return course.get('year') === yearTitle;
      });
    });
  }
});
