import Ember from 'ember';
import SortableByPosition from 'ilios/mixins/sortable-by-position';

const { computed, Component, RSVP } = Ember;
const { Promise, all } = RSVP;

export default Component.extend(SortableByPosition, {
  editable: true,
  isSorting: false,
  isSaving: false,
  course: null,
  totalObjectivesToSave: null,
  currentObjectivesSaved: null,

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

  sortedObjectives: computed('objectives.[]', function(){
    return new Promise(resolve => {
      this.get('objectives').then(objectives => {
        resolve(objectives.toArray().sort(this.get('positionSortingCallback')));
      });
    });
  }),

  classNames: ['course-objective-list'],
  objectivesForRemovalConfirmation: [],

  saveSomeObjectives(arr){
    let chunk = arr.splice(0, 5);
    return all(chunk.invoke('save')).then(() => {
      if (arr.length){
        this.set('currentObjectivesSaved', this.get('currentObjectivesSaved') + chunk.length);
        return this.saveSomeObjectives(arr);
      }
    });
  },

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
      this.set('currentObjectivesSaved', 0);

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
