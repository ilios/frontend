import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['learning-material-table-actions'],
  actions: {
    clickTrash() {
      const row = this.get('row');
      row.set('expanded', true);
      row.set('confirmDelete', true);
    }
  }
});
