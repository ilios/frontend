import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  id: 2013,
  title: function(){
    return this.id;
  },
});
