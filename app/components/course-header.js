import Ember from 'ember';
import Publishable from 'ilios/mixins/publishable';

export default Ember.Component.extend(Publishable, {
  course: null,
  publishTarget: Ember.computed.alias('course'),
  publishEventCollectionName: 'courses',
  editable: true,
  actions: {
    changeTitle: function(newTitle){
      this.get('course').set('title', newTitle);
      this.get('course').save();
    },
  }
});
