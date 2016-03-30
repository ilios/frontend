import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  course: null,
  editable: true,

  showCollapsible: computed('course.competencies.[]', function () {
    const competencies = this.get('course.competencies');
    return competencies.get('length');
  }),

  actions: {
    collapse(){
      this.get('course.competencies').then(competencies => {
        if (competencies.get('length')) {
          this.attrs.collapse();
        }
      });
    },
  }
});
