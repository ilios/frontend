/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import scrollTo from 'ilios-common/utils/scroll-to';
import layout from '../templates/components/session-details';

export default Component.extend({
  layout,
  tagName: 'section',
  classNames: ['session-details'],
  sessionTypes: null,
  session: null,
  editable: false,
  sessionObjectiveDetails: null,
  sessionTaxonomyDetails: null,
  sessionLeadershipDetails: null,
  sessionManageLeadership: false,
  'data-test-session-details': true,

  didInsertElement() {
    const id = this.$().attr('id');

    scrollTo(`#${id}`);
  },
  actions: {
    save() {
      const  session = this.get('session');
      session.save();
    },
  }
});
