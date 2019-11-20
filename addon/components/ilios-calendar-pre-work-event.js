import Component from '@ember/component';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Component.extend({
  router: service(),
  tagName: '',
  postrequisiteLink: computed('event.postrequisiteSlug', function () {
    return this.router.urlFor('events', this.event.postrequisiteSlug);
  }),
});
