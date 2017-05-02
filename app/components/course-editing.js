import Ember from 'ember';

const { Component, computed } = Ember;
const { not } = computed;

export default Component.extend({
  editable: not('course.locked'),
  courseObjectiveDetails: false,
  courseTaxonomyDetails: false,
  courseCompetencyDetails: false,
  actions: {
    save: function(){
      const course = this.get('course');
      course.save();
    },
  }
});
