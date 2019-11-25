import Component from '@ember/component';
import EmberObject, { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),

  classNames: ['school-session-type-manager'],

  canUpdate: false,
  sessionType: null,

  readonlySessionType: computed('sessionType', async function() {
    const sessionType = this.sessionType;
    if (!sessionType) {
      return null;
    }
    const { title, calendarColor, assessment, active: isActive } = sessionType;
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

  save: task(function* (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) {
    const sessionType = this.sessionType;
    const closeComponent = this.close;
    const aamcMethods = [];
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
  })
});
