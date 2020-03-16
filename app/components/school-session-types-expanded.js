import Component from '@ember/component';
import { computed } from '@ember/object';
import { notEmpty } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),
  tagName: "",
  canCreate: false,
  canDelete: false,
  canUpdate: false,
  managedSessionTypeId: null,
  school: null,
  isManaging: notEmpty('managedSessionTypeId'),

  isCollapsible: computed('isManaging', 'school.session-types.length', async function() {
    const school = this.school;
    const isManaging = this.isManaging;
    const sessionTypes = await school.get('sessionTypes');
    return sessionTypes.get('length') && ! isManaging;
  }),

  sessionTypes: computed('school.sessionTypes.[]', async function() {
    const school = this.school;
    return await school.get('sessionTypes');
  }),

  managedSessionType: computed('managedSessionTypeId', async function() {
    const managedSessionTypeId = this.managedSessionTypeId;
    const sessionTypes = await this.sessionTypes;
    const sessionType = sessionTypes.findBy('id', managedSessionTypeId);
    return sessionType;
  }),

  actions: {
    async collapse() {
      const isCollapsible = this.isCollapsible;
      const collapse = this.collapse;
      const setSchoolManagedSessionType = this.setSchoolManagedSessionType;
      if (isCollapsible) {
        collapse();
        setSchoolManagedSessionType(null);
      }
    },

    cancel() {
      const setSchoolManagedSessionType = this.setSchoolManagedSessionType;
      setSchoolManagedSessionType(null);
    },

    toggleSchoolNewSessionType() {
      const schoolNewSessionType = this.schoolNewSessionType;
      const setSchoolNewSessionType = this.setSchoolNewSessionType;
      setSchoolNewSessionType(!schoolNewSessionType);
    }
  },

  save: task(function* (title, calendarColor, assessment, assessmentOption, aamcMethod, isActive) {
    const store = this.store;
    const sessionType = store.createRecord('sessionType');
    const closeComponent = this.setSchoolNewSessionType;
    const school = this.school;
    const aamcMethods = [];
    if (aamcMethod) {
      aamcMethods.pushObject(aamcMethod);
    }
    sessionType.setProperties({
      school,
      title,
      calendarColor,
      assessment,
      assessmentOption,
      aamcMethods,
      active: isActive
    });

    yield sessionType.save();
    closeComponent(false);
  })
});
