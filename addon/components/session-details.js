import Component from '@ember/component';
import scrollTo from 'ilios-common/utils/scroll-to';

export default Component.extend({
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
    scrollTo(`#${this.element.id}`);
  },
  actions: {
    save() {
      const  session = this.get('session');
      session.save();
    },
  }
});
