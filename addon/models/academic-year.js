import { computed } from '@ember/object';
import DS from 'ember-data';

const { attr, Model } = DS;

export default Model.extend({
  title: attr('number'),
  academicYearTitle: computed('title', function(){
    return this.get('title') + ' - ' + (parseInt(this.get('title')) + 1);
  }),
});
