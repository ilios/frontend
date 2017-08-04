import Ember from 'ember';
import Column from 'ember-light-table/components/columns/base';

const { computed, inject } = Ember;

export default Column.extend({
  i18n: inject.service(),
  label: computed('column.labelKey', 'i18n.locale', function(){
    const i18n = this.get('i18n');
    const labelKey = this.get('column.labelKey');

    return i18n.t(labelKey);
  }),
});
