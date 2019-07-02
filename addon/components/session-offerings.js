import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/session-offerings';

const { alias, oneWay } = computed;

export default Component.extend({
  store: service(),
  intl: service(),
  saving: false,
  layout,
  tagName: 'section',
  classNames: ['session-offerings'],
  session: null,
  offeringEditorOn: false,
  'data-test-session-offerings': true,
  offerings: oneWay('session.offerings'),
  cohorts: alias('session.course.cohorts'),
});
