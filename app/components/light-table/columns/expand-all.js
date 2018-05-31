import Column from 'ember-light-table/components/columns/base';
import { computed } from '@ember/object';

export default Column.extend({
  // classNames: ['clickable'],
  allRowsExpanded: computed('table.rows.@each.expanded', function () {
    const { rows } = this.get('table');
    if (rows.length === 0) {
      return false;
    }
    return rows.isEvery('expanded', true);
  }),
});
