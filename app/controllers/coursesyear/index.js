import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  needs: ['coursesschool', 'coursesyear'],
  currentSchool: Ember.computed.alias("controllers.coursesschool.model"),
  currentYear: Ember.computed.alias("controllers.coursesyear.model"),
  sortAscending: true,
  filter: '',
  sortProperties: ['title'],
  sortFunction: function(a,b){
    if(a == null){
      return 1;
    }
    if(b == null){
      return -1;
    }
    return Ember.compare(a,b);
  },
  filteredContent: function(){
    var filter = this.get('filter');
    var exp = new RegExp(filter, 'gi');
    var groups = this.get('arrangedContent');
    if(groups == null){
      return Ember.A();
    }
    return groups.filter(function(group) {
      if(group.get('title') === null){
        return true;
      }
      return group.get('title').match(exp);
    });

  }.property('arrangedContent.@each', 'filter'),
  actions: {
    createNewCourse: function(){
      var course = this.store.createRecord('course', {
        title: null,
        owningSchool: this.get('currentSchool'),
        year: this.get('currentYear.title')
      });
      this.get('model').pushObject(course);
      this.get('currentSchool').get('courses').then(function(courses){
        courses.pushObject(course);
      });
    }
  }
});
