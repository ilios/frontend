import Ember from 'ember';

const { computed, Component, RSVP } = Ember;
const { Promise } = RSVP;
const { sort } = computed;

export default Component.extend({
  editable: true,
  isSorting: false,
  isSaving: false,
  course: null,
  objectives: computed('course.objectives.[]', function(){
    return this.get('course').get('objectives');
  }),

  hasMoreThanOneObjective: computed('objectives.[]', function(){
    return new Promise(resolve => {
      this.get('objectives').then(objectives => {
        resolve(objectives.length > 1);
      });
    });
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
    },
    saveSortOrder(objectives){
      this.set('isSaving', true);
      for (let i = 0, n = objectives.length; i < n; i++) {
        let lm = objectives[i];
        lm.set('position', i + 1);
      }
      this.set('totalObjectivesToSave', objectives.length);
      this.set('currentObjectiveSaved', 0);

      this.saveSomeObjectives(objectives).then(() => {
        this.set('isSaving', false);
        this.set('isSorting', false);
      });
    },

    cancelSorting() {
      this.set('isSorting', false);
    },

  }
});
