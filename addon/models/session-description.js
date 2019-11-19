import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  description: attr('string'),
  session: belongsTo('session', {async: true}),
  textDescription: computed('description', function(){
    var title = this.get('description');
    if(title === undefined){
      return '';
    }
    return title.replace(/(<([^>]+)>)/ig,"");
  })
});
