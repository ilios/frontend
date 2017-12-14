import { computed } from '@ember/object';
import DS from 'ember-data';

const { attr, belongsTo, Model } = DS;

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
