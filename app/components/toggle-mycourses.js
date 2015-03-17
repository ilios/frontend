import Ember from 'ember';
import layout from '../templates/components/toggle-mycourses';

export default Ember.Component.extend({
  layout: layout,
  actions: {
  	toggleMyCourses: function(){
  	  this.sendAction('toggleMyCourses');
  	}
  }
});
