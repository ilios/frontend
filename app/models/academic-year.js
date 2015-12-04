import Ember from 'ember';
import DS from 'ember-data';

const { computed } = Ember;

export default DS.Model.extend({
  title: DS.attr('number'),
  academicYearTitle: computed('title', function(){
    return this.get('title') + ' - ' + (parseInt(this.get('title')) + 1);
  }),
});
