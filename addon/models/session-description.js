import { computed } from '@ember/object';
import DS from 'ember-data';

export default DS.Model.extend({
  description: DS.attr('string'),
  session: DS.belongsTo('session', {async: true}),
  textDescription: computed('description', function(){
    var title = this.get('description');
    if(title === undefined){
      return '';
    }
    return title.replace(/(<([^>]+)>)/ig,"");
  })
});
