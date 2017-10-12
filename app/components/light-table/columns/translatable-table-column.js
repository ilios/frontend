import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Column from 'ember-light-table/components/columns/base';

export default Column.extend({
  i18n: service(),
  label: computed('column.labelKey', 'i18n.locale', function(){
    const i18n = this.get('i18n');
    const labelKey = this.get('column.labelKey');

    return i18n.t(labelKey);
  }),
});
