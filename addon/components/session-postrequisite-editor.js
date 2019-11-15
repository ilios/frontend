import Component from '@ember/component';
import { task } from 'ember-concurrency';
import { computed } from '@ember/object';
import layout from '../templates/components/session-postrequisite-editor';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';

export default Component.extend({
  layout,
  tagName: '',
  filter: '',

  selectedPostrequisite: null,
  linkablePostrequisites: computed('session.course.sessions.[]', async function () {
    const course = await this.session.course;
    const sessions = await course.sessions;
    return sessions.sortBy("title").filter(sessionInCourse => sessionInCourse.id !== this.session.id);
  }),
  filteredPostrequisites: computed('linkablePostrequisites.[]', 'filter', async function () {
    const linkablePostrequisites = await this.linkablePostrequisites;
    if (!this.filter) {
      return linkablePostrequisites;
    }
    let exp = new RegExp(escapeRegExp(this.filter), 'gi');
    return linkablePostrequisites.filter(session => session.title.match(exp));
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
    },
    setFilter(filter) {
      this.set('filter', filter);
    }
  },
  save: task(function* () {
    this.session.set('postrequisite', this.selectedPostrequisite);
    yield this.session.save();
    this.close();
  }),
});
