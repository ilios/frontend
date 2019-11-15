import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import layout from '../templates/components/session-postrequisite-editor';

export default Component.extend({
  layout,
  tagName: '',

  selectedPostrequisite: null,
  linkablePostrequisites: computed('session.course.sessions.[]', async function () {
    const course = await this.session.course;
    const sessions = await course.sessions;
    return sessions.sortBy("title").filter(sessionInCourse => sessionInCourse.id !== this.session.id);
  }),
  didReceiveAttrs(){
    this._super(...arguments);
    this.get('session.postrequisite').then(postrequisite => {
      this.set('selectedPostrequisite', postrequisite);
    });
  },
  actions: {
    setPostrequisite(postrequisite) {
      this.set('selectedPostrequisite', postrequisite);
    }
  },
  save: task(function* () {
    this.session.set('postrequisite', this.selectedPostrequisite);
    yield this.session.save();
    this.close();
  }),
});
