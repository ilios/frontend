import Ember from 'ember';

const { Component, computed, inject } = Ember;
const { notEmpty } = computed;
const { service } = inject;

export default Component.extend({
  store: service(),
  school: null,
  tagName: 'section',
  classNames: ['school-session-types-expanded'],
  managedSessionTypeId: null,
  isManaging: notEmpty('managedSessionTypeId'),
  isCollapsible: computed('isManaging', 'school.session-types.length', async function(){
    const school = this.get('school');
    const isManaging = this.get('isManaging');
    const sessionTypes = await school.get('sessionTypes');

    return sessionTypes.get('length') && ! isManaging;
  }),
  sessionTypes: computed('school.sessionTypes.[]', async function(){
    const school = this.get('school');
    return await school.get('sessionTypes');
  }),
  managedSessionType: computed('managedSessionTypeId', async function(){
    const managedSessionTypeId = this.get('managedSessionTypeId');
    const sessionTypes = await this.get('sessionTypes');
    const sessionType = sessionTypes.findBy('id', managedSessionTypeId);

    return sessionType;
  }),
  actions: {
    async collapse(){
      const isCollapsible = this.get('isCollapsible');
      const collapse = this.get('collapse');
      const setSchoolManagedSessionType = this.get('setSchoolManagedSessionType');
      if (isCollapsible) {
        collapse();
        setSchoolManagedSessionType(null);
      }
    },
    cancel(){
      const setSchoolManagedSessionType = this.get('setSchoolManagedSessionType');
      setSchoolManagedSessionType(null);
    },
  }
});
