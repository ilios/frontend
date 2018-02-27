import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
import RSVP from 'rsvp';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';

const { alias } = computed;
const { all } = RSVP;

export default Mixin.create(SortableByPosition, {
  subject: null,
  totalObjectivesToSave: null,
  currentObjectivesSaved: null,
  isSorting: false,
  isSaving: false,

  objectives: alias('subject.sortedObjectives'),

  hasMoreThanOneObjective: computed('objectives.[]', async function(){
    const objectives = await this.get('objectives');
    return (objectives.length > 1);
  }),

  async saveSomeObjectives(arr){
    let chunk = arr.splice(0, 5);
    await all(chunk.invoke('save'));
    if (arr.length) {
      this.set('currentObjectivesSaved', this.get('currentObjectivesSaved') + chunk.length);
      return this.saveSomeObjectives(arr);
    }
  },

  actions: {
    async saveSortOrder(objectives){
      this.set('isSaving', true);
      for (let i = 0, n = objectives.length; i < n; i++) {
        let lm = objectives[i];
        lm.set('position', i + 1);
      }
      this.set('totalObjectivesToSave', objectives.length);
      this.set('currentObjectivesSaved', 0);

      await this.saveSomeObjectives(objectives);
      this.set('isSaving', false);
      this.set('isSorting', false);
    },

    cancelSorting() {
      this.set('isSorting', false);
    },
  }
});
