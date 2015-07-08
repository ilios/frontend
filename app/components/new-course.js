import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  tagName: 'section',
  classNames: ['new-course', 'new-result', 'form-container'],
  placeholder: t('courses.courseTitlePlaceholder'),
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
