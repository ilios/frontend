import Route from '@ember/routing/route';
import { get } from '@ember/object';
import { inject as service } from '@ember/service';
import IndexRouteMixin from 'ilios-common/mixins/course/index-route';

export default Route.extend(IndexRouteMixin, {
  preserveScroll: service(),

  beforeModel(transition) {
    const isFromSessionIndex = get(transition, 'from.name') === 'session.index';
    this.preserveScroll.set('shouldScrollDown', isFromSessionIndex);
  },

  actions: {
    willTransition(transition) {
      this.preserveScroll.set('isListenerOn', false);
      if (transition.targetName !== 'session.index') {
        this.preserveScroll.set('yPos', null);
      }
    }
  }
});
