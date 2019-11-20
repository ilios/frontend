import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default Component.extend({
  router: service(),

  classNames: ['session-publicationcheck'],

  session: null,

  showUnlinkIcon: computed('session.objectives.[]', function() {
    const objectives = this.session.objectives;
    return objectives.any((objective) => isEmpty(objective.parents));
  }),

  actions: {
    transitionToSession() {
      const queryParams = { sessionObjectiveDetails: true };
      this.router.transitionTo('session', this.session, { queryParams });
    }
  }
});
