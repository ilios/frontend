import Component from '@ember/component';
import { computed } from '@ember/object';
import Table from 'ember-light-table';
import { task } from 'ember-concurrency';
import SortableByPosition from 'ilios-common/mixins/sortable-by-position';

export default Component.extend(SortableByPosition, {
  classNames: ['learning-material-table'],
  learningMaterials: null,

  table: computed('sortedLearningMaterials.[]', 'columns.[]', function () {
    const columns = this.get('columns');
    const sortedLearningMaterials = this.get('sortedLearningMaterials');
    const table = new Table(columns, sortedLearningMaterials);

    return table;
  }),

  sortedLearningMaterials: computed('learningMaterials.[]', 'learningMaterials.@each.position', function () {
    const learningMaterials = this.get('learningMaterials');
    if (!learningMaterials) {
      return [];
    }
    let sortedMaterials = learningMaterials.toArray().sort(this.positionSortingCallback);

    return sortedMaterials;
  }),

  columns: computed(function () {
    const title = {
      type: 'translatable-table-column',
      cellComponent: 'learning-material-table-title',
      labelKey: 'general.title',
      valuePath: 'learningMaterial.title',
      breakpoints: ['smallScreen', 'mediumScreen', 'largeScreen', 'giantScreen'],
      sortable: false,
    };
    const owner = {
      type: 'translatable-table-column',
      labelKey: 'general.owner',
      valuePath: 'learningMaterial.owningUser.fullName',
      width: '250px',
      breakpoints: ['giantScreen'],
      sortable: false,
    };
    const required = {
      type: 'translatable-table-column',
      cellComponent: 'yesno-table-cell',
      labelKey: 'general.required',
      valuePath: 'required',
      width: '90px',
      align: 'center',
      breakpoints: ['largeScreen', 'giantScreen'],
      sortable: false,
    };
    const notes = {
      type: 'translatable-table-column',
      cellComponent: 'learning-material-table-notes',
      labelKey: 'general.notes',
      valuePath: 'notes',
      width: '90px',
      breakpoints: ['largeScreen', 'giantScreen'],
      sortable: false,
    };
    const mesh = {
      type: 'translatable-table-column',
      cellComponent: 'learning-material-table-mesh',
      labelKey: 'general.mesh',
      valuePath: 'meshDescriptors.length',
      width: '100px',
      align: 'center',
      breakpoints: ['mediumScreen', 'largeScreen', 'giantScreen'],
      sortable: false,
    };
    const status = {
      type: 'translatable-table-column',
      cellComponent: 'learning-material-table-status',
      labelKey: 'general.status',
      valuePath: 'learningMaterial.status.title',
      width: '90px',
      align: 'left',
      breakpoints: ['mediumScreen', 'largeScreen', 'giantScreen'],
      sortable: false,
    };
    const actions = {
      cellComponent: 'learning-material-table-actions',
      width: '40px',
      align: 'center',
      breakpoints: ['smallScreen', 'mediumScreen', 'largeScreen', 'giantScreen'],
      sortable: false,
    };

    return [title, owner, required, notes, mesh, status, actions];
  }),

  removeLearningMaterial: task(function * (learningMaterial) {
    const remove = this.get('remove');
    yield remove(learningMaterial);
  }).drop(),

  actions: {
    cancelRemove(row) {
      row.set('confirmDelete', false);
      row.set('expanded', false);
    },
  }
});
