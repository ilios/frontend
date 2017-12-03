/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';

const { all } = RSVP;

export default Component.extend({
  store: service(),
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
    try {
      return yield all(toSave.invoke('save'));
    } finally {
      this.get('manage')(false);
    }
  }),
});
