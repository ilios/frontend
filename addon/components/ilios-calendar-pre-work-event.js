import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from '../templates/components/ilios-calendar-pre-work-event';
import { computed } from '@ember/object';

export default Component.extend({
  layout,
  router: service(),
  tagName: '',
  postrequisiteLink: computed('event.postrequisiteSlug', function () {
    return this.router.urlFor('events', this.event.postrequisiteSlug);
  }),
});
