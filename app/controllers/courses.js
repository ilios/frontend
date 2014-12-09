import Ember from 'ember';

export default Ember.ArrayController.extend(Ember.I18n.TranslateableProperties, {
  queryParams: ['school', 'year', 'mycourses', 'filter'],
  placeholderValueTranslation: 'courses.titleFilterPlaceholder',
  school: null,
  year: null,
  mycourses: false,
  filter: null,

  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('filter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('filter'));
  },

  sortAscending: true,
  sortProperties: ['title'],

  filteredCourses: function(){
    var self = this;
    var filteredCourses = this.get('arrangedContent');
    if(filteredCourses == null || filteredCourses.length === 0){
      return Ember.A();
    }
    var titleFilter = this.get('debouncedFilter');
    var schoolFilter = this.get('school');
    var mycoursesFilter = this.get('mycourses');
    var educationalYearFilter = null;
    if(this.get('year') != null){
      educationalYearFilter = this.get('educationalYears').findBy('id', this.get('year')).get('title');
    }
    var exp = new RegExp(titleFilter, 'gi');
    filteredCourses = filteredCourses.filter(function(course) {
      if(titleFilter != null && titleFilter.length > 0 && !course.get('title').match(exp)){
        return false;
      }
      if(schoolFilter != null && course.get('owningSchool.id') !== schoolFilter){
        return false;
      }
      if(educationalYearFilter != null && course.get('year') !== educationalYearFilter){
        return false;
      }
      if(mycoursesFilter && !course.get('relatedUsers').contains(self.get('currentUser'))){
        return false;
      }

      return true;
    });

    return filteredCourses;
  }.property('arrangedContent.@each', 'mycourses', 'debouncedFilter', 'school', 'year'),
});
