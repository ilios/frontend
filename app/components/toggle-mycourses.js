import Ember from 'ember';
import layout from '../templates/components/toggle-mycourses';

const { Component } = Ember;

export default Component.extend({
  layout: layout,
  classNames: ['toggle-mycourses'],
  actions: {
    toggleMyCourses() {
      this.sendAction('toggleMyCourses');
    }
  }
});
