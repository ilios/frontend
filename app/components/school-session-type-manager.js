import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, computed, inject } = Ember;
const { service } = inject;

export default Component.extend({
  store: service(),
  sessionType: null,
  classNames: ['school-session-type-manager'],
  assessmentOptions: computed(async function(){
    const store = this.get('store');
    return await store.findAll('assessment-option');
  }),
  save: task(function * (title, calendarColor, assessment, assessmentOption) {
    const sessionType = this.get('sessionType');
    const closeComponent = this.get('close');
    sessionType.setProperties({
      title,
      calendarColor,
      assessment,
      assessmentOption
    });

    yield sessionType.save();
    closeComponent();
  }),
});
