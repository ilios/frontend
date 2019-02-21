
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/session-offerings';
import { translationMacro as t } from "ember-intl";

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
  placeholderValue: t('general.sessionTitleFilterPlaceholder'),
  offerings: oneWay('session.offerings'),
  newButtonTitle: t('general.add'),
  cohorts: alias('session.course.cohorts'),
});
