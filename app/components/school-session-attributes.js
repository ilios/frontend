import Ember from 'ember';
import { task } from 'ember-concurrency';
import config from '../config/environment';

const { IliosFeatures: { schoolSessionAttributes } } = config;
const { Component, RSVP, inject, computed } = Ember;
const { all } = RSVP;
const { service } = inject;

export default Component.extend({
  store: service(),
  schoolSessionAttributes,
  classNames: ['school-session-attributes'],
  school: null,
  isManaging: false,
  details: false,
  showSessionAttendanceRequired: computed('school.configurations.[]', 'school.configurations.@each.value', async function(){
    const school = this.get('school');
    return await school.getConfigValue('showSessionAttendanceRequired');
  }),
  showSessionSupplemental: computed('school.configurations.[]', 'school.configurations.@each.value', async function(){
    const school = this.get('school');
    return await school.getConfigValue('showSessionSupplemental');
  }),
  showSessionSpecialAttireRequired: computed('school.configurations.[]', 'school.configurations.@each.value', async function(){
    const school = this.get('school');
    return await school.getConfigValue('showSessionSpecialAttireRequired');
  }),
  showSessionSpecialEquipmentRequired: computed('school.configurations.[]', 'school.configurations.@each.value', async function(){
    const school = this.get('school');
    return await school.getConfigValue('showSessionSpecialEquipmentRequired');
  }),
  save: task(function * (newValues){
    const school = this.get('school');
    const names = [
      'showSessionAttendanceRequired',
      'showSessionSupplemental',
      'showSessionSpecialAttireRequired',
      'showSessionSpecialEquipmentRequired',
    ];
    let toSave = [];
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const config = yield school.setConfigValue(name, newValues.get(name));
      if (config) {
        toSave.pushObject(config);
      }
    }

    yield all(toSave.invoke('save'));
    return this.get('manage')(false);
  }),
});
