/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/session-offerings';
import { translationMacro as t } from "ember-i18n";

const { alias, oneWay } = computed;

export default Component.extend({
  saving: false,
  store: service(),
  i18n: service(),
  layout,
  tagName: 'section',
  classNames: ['session-offerings'],
  session: null,
  placeholderValue: t('general.sessionTitleFilterPlaceholder'),
  offerings: oneWay('session.offerings'),
  newButtonTitle: t('general.add'),
  offeringEditorOn: false,
  cohorts: alias('session.course.cohorts'),
});
