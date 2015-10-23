import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

const {inject, isEmpty, computed, isPresent} = Ember;
const {service} = inject;

export default Ember.Component.extend({
  i18n: service(),
  store: service(),
  tagName: 'section',
  classNames: ['new-course', 'new-result', 'form-container'],
  placeholder: t('courses.courseTitlePlaceholder'),
  years: [],
  currentYear: null,
  currentSchool: null,
  title: null,
  selectedYear: null,
  bestSelectedYear: computed('selectedYear', 'currentYear', function(){
    if(isPresent(this.get('selectedYear'))){
      return this.get('selectedYear');
    }
    
    return this.get('currentYear');
  }),
  actions: {
    setYear: function(yearTitle){
      let selectedYear = this.get('years').find(year => {
        return year.get('title') === parseInt(yearTitle);
      });
      this.set('selectedYear', selectedYear);
    },
    save: function(){
      let year = this.get('selectedYear') || this.get('currentYear');
      if(isEmpty(year)){
        throw new Error("Tried to save a course with no year context");
      }
      let course = this.get('store').createRecord('course', {
        title: this.get('title'),
        school: this.get('currentSchool'),
        year: year.get('title'),
        level: 1,
      });
      this.sendAction('save', course);
    },
    cancel: function(){
      this.sendAction('cancel', this.get('course'));
    }
  }
});
