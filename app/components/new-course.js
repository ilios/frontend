import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  placeholderTranslation: 'courses.courseTitlePlaceholder',
  course: null,
  years: [],
  currentAcademicYear: function(){
    var year = this.get('years').filterBy('title', this.get('course.year')).get('firstObject');
    if(year){
      return year.get('academicYearTitle');
    }
    return '';
  }.property('course.year', 'years.@each'),
  actions: {
    setYear: function(year){
      this.get('course').set('year', year.get('title'));
    },
    save: function(){
      this.sendAction('save', this.get('course'));
    },
    cancel: function(){
      this.sendAction('cancel', this.get('course'));
    }
  }
});
