import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, computed, inject, Object: EmberObject } = Ember;
const { service } = inject;

export default Component.extend({
  store: service(),
  sessionType: null,
  classNames: ['school-session-type-manager'],
  readonlySessionType: computed('sessionType', async function(){
    const sessionType = this.get('sessionType');
    if (!sessionType) {
      return null;
    }
    const { title, calendarColor, assessment } = sessionType.getProperties('title', 'calendarColor', 'assessment');
    const assessmentOption = await sessionType.get('assessmentOption');
    const selectedAssessmentOptionId = assessmentOption?assessmentOption.get('id'):null;
    const firstAamcMethod = await sessionType.get('firstAamcMethod');
    const selectedAamcMethodId = firstAamcMethod?firstAamcMethod.get('id'):null;
    const readonlySessionType = EmberObject.create({
      title,
      calendarColor,
      assessment,
      selectedAssessmentOptionId,
      selectedAamcMethodId
    });

    return readonlySessionType;
  }),

  save: task(function * (title, calendarColor, assessment, assessmentOption, aamcMethod) {
    const sessionType = this.get('sessionType');
    const closeComponent = this.get('close');
    let aamcMethods = [];
    if (aamcMethod) {
      aamcMethods.pushObject(aamcMethod);
    }
    sessionType.setProperties({
      title,
      calendarColor,
      assessment,
      assessmentOption,
      aamcMethods,
    });

    yield sessionType.save();
    closeComponent();
  }),
});
