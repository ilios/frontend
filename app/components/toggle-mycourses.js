import Ember from 'ember';
import layout from '../templates/components/toggle-mycourses';

const { Component } = Ember;

export default Component.extend({
  layout: layout,
  actions: {
    toggleMyCourses: function(){
      this.sendAction('toggleMyCourses');
    }
  }
});
