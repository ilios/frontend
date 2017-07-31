import Component from '@ember/component';
import layout from '../templates/components/toggle-mycourses';

export default Component.extend({
  layout: layout,
  classNames: ['toggle-mycourses'],
  actions: {
    toggleMyCourses() {
      this.sendAction('toggleMyCourses');
    }
  }
});
