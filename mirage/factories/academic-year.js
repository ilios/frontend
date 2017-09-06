import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  id: 2013,
  title: function(){
    return this.id;
  },
});
