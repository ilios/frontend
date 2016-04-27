import Ember from 'ember';

const { computed, Component } = Ember;
const { sort } = computed;

export default Component.extend({
  editable: true,
  course: null,
  objectives: computed('course.objectives.[]', function(){
    return this.get('course').get('objectives');
  }),
  sortedObjectives: sort('objectives', function(a, b){
    return parseInt(a.get( 'id' )) - parseInt(b.get( 'id' ));
  }),
  classNames: ['course-objective-list'],
  objectivesForRemovalConfirmation: [],
  actions: {
    remove(objective){
      objective.deleteRecord();
      objective.save();
    },
    cancelRemove(objective){
      this.get('objectivesForRemovalConfirmation').removeObject(objective.get('id'));
    },
    confirmRemoval(objective){
      this.get('objectivesForRemovalConfirmation').pushObject(objective.get('id'));
    }
  }
});
