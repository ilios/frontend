import Ember from 'ember';
import SortableByPosition from 'ilios/mixins/sortable-by-position';

const { computed, Mixin, RSVP } = Ember;
const { all, Promise } = RSVP;

export default Mixin.create(SortableByPosition, {
  subject: null,
  totalObjectivesToSave: null,
  currentObjectivesSaved: null,
  isSorting: false,
  isSaving: false,

  objectives: computed('subject.objectives.[]', function(){
    return this.get('subject').get('objectives');
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
