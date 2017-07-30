import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, computed, Object: EmberObject } = Ember;

export default Component.extend({
  store: Ember.inject.service(),
  sessionType: null,
  classNames: ['school-session-type-manager'],
  readonlySessionType: computed('sessionType', async function(){
    const sessionType = this.get('sessionType');
    if (!sessionType) {
      return null;
    }
    const { title, calendarColor, assessment, active: isActive } = sessionType.getProperties('title', 'calendarColor', 'assessment', 'active');
    const assessmentOption = await sessionType.get('assessmentOption');
    const selectedAssessmentOptionId = assessmentOption?assessmentOption.get('id'):null;
    const firstAamcMethod = await sessionType.get('firstAamcMethod');
    const selectedAamcMethodId = firstAamcMethod?firstAamcMethod.get('id'):null;
    const readonlySessionType = EmberObject.create({
      title,
      calendarColor,
      assessment,
      selectedAssessmentOptionId,
      selectedAamcMethodId,
      isActive
    });

    return readonlySessionType;
  }),

  save: task(function * (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) {
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
      active: isActive,
    });

    yield sessionType.save();
    closeComponent();
  }),
});
