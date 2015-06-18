import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';

export default Ember.Component.extend(Publishable, {
  program: null,
  publishTarget: Ember.computed.alias('program'),
  publishEventCollectionName: 'programs',
  actions: {
    changeTitle: function(newTitle){
      this.get('program').set('title', newTitle);
      this.get('program').save();
    },
  }
});
