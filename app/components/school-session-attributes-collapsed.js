import Component from '@ember/component';

export default Component.extend({
  classNames: ['school-session-attributes-collapsed'],
  tagName: 'section',

  showSessionAttendanceRequired: false,
  showSessionSpecialAttireRequired: false,
  showSessionSpecialEquipmentRequired: false,
  showSessionSupplemental: false
});
