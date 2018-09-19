/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import EmberObject from '@ember/object';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';

export default Component.extend({
  tagName: 'section',
  classNames: ['school-session-attributes-expanded'],
  showSessionAttendanceRequired: false,
  showSessionSupplemental: false,
  showSessionSpecialAttireRequired: false,
  showSessionSpecialEquipmentRequired: false,
  isManaging: false,
  canUpdate: false,
  didReceiveAttrs(){
    this._super(...arguments);
    const isManaging = this.isManaging;
    if (isManaging) {
      const showSessionAttendanceRequired = this.showSessionAttendanceRequired;
      const showSessionSupplemental = this.showSessionSupplemental;
      const showSessionSpecialAttireRequired = this.showSessionSpecialAttireRequired;
      const showSessionSpecialEquipmentRequired = this.showSessionSpecialEquipmentRequired;

      this.set('bufferedShowSessionAttendanceRequired', showSessionAttendanceRequired);
      this.set('bufferedShowSessionSupplemental', showSessionSupplemental);
      this.set('bufferedShowSessionSpecialAttireRequired', showSessionSpecialAttireRequired);
      this.set('bufferedShowSessionSpecialEquipmentRequired', showSessionSpecialEquipmentRequired);
    }
  },
  bufferedShowSessionAttendanceRequired: false,
  bufferedShowSessionSupplemental: false,
  bufferedShowSessionSpecialAttireRequired: false,
  bufferedShowSessionSpecialEquipmentRequired: false,
  save: task(function * (){
    const bufferedShowSessionAttendanceRequired = this.bufferedShowSessionAttendanceRequired;
    const bufferedShowSessionSupplemental = this.bufferedShowSessionSupplemental;
    const bufferedShowSessionSpecialAttireRequired = this.bufferedShowSessionSpecialAttireRequired;
    const bufferedShowSessionSpecialEquipmentRequired = this.bufferedShowSessionSpecialEquipmentRequired;

    const showSessionAttendanceRequired = isEmpty(bufferedShowSessionAttendanceRequired)?false:bufferedShowSessionAttendanceRequired;
    const showSessionSupplemental = isEmpty(bufferedShowSessionSupplemental)?false:bufferedShowSessionSupplemental;
    const showSessionSpecialAttireRequired = isEmpty(bufferedShowSessionSpecialAttireRequired)?false:bufferedShowSessionSpecialAttireRequired;
    const showSessionSpecialEquipmentRequired = isEmpty(bufferedShowSessionSpecialEquipmentRequired)?false:bufferedShowSessionSpecialEquipmentRequired;

    const values = EmberObject.create({
      showSessionAttendanceRequired,
      showSessionSupplemental,
      showSessionSpecialAttireRequired,
      showSessionSpecialEquipmentRequired
    });

    yield this.saveAll(values);
  }),
  actions: {
    cancel(){
      this.manage(false);
      this.set('bufferedShowSessionAttendanceRequired', false);
      this.set('bufferedShowSessionSupplemental', false);
      this.set('bufferedShowSessionSpecialAttireRequired', false);
      this.set('bufferedShowSessionSpecialEquipmentRequired', false);
    },
    enableSessionAttributeConfig(name){
      const bufferName = 'buffered' + name.capitalize();
      this.set(bufferName, true);
    },
    disableSessionAttributeConfig(name){
      const bufferName = 'buffered' + name.capitalize();
      this.set(bufferName, false);
    },
  }
});
