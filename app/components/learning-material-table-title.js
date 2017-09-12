import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['learning-material-table-title', 'link'],
  click() {
    const row = this.get('row');
    const manageMaterial = this.get('tableActions.manageMaterial');
    manageMaterial(row.get('content'));
  }
});
