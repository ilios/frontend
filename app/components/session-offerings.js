import Ember from 'ember';
import layout from '../templates/components/session-offerings';
import { translationMacro as t } from "ember-i18n";

const { Component, computed} = Ember;
const { alias, oneWay } = computed;

export default Component.extend({
  saving: false,
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
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
