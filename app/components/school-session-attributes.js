import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default Component.extend({
  store: service(),

  classNames: ['school-session-attributes'],

  canUpdate: false,
  details: false,
  isManaging: false,
  school: null,

  showSessionAttendanceRequired: computed('school.configurations.[]', 'school.configurations.@each.value', async function() {
    return await this.school.getConfigValue('showSessionAttendanceRequired');
  }),

  showSessionSupplemental: computed('school.configurations.[]', 'school.configurations.@each.value', async function() {
    return await this.school.getConfigValue('showSessionSupplemental');
  }),

  showSessionSpecialAttireRequired: computed('school.configurations.[]', 'school.configurations.@each.value', async function() {
    return await this.school.getConfigValue('showSessionSpecialAttireRequired');
  }),

  showSessionSpecialEquipmentRequired: computed('school.configurations.[]', 'school.configurations.@each.value', async function() {
    return await this.school.getConfigValue('showSessionSpecialEquipmentRequired');
  }),

  actions: {
    async save(newValues) {
      const school = this.school;
      const names = [
        'showSessionAttendanceRequired',
        'showSessionSupplemental',
        'showSessionSpecialAttireRequired',
        'showSessionSpecialEquipmentRequired',
      ];
      let toSave = [];
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        const config = await school.setConfigValue(name, newValues.get(name));
        if (config) {
          toSave.pushObject(config);
        }
      }
      try {
        return await all(toSave.invoke('save'));
      } finally {
        this.manage(false);
      }
    }
  }
});
