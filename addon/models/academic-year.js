import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  title: attr('number'),
  academicYearTitle: computed('title', function(){
    return this.get('title') + ' - ' + (parseInt(this.get('title'), 10) + 1);
  }),
});
