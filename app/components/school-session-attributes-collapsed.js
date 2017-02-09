import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  classNames: ['school-session-attributes-collapsed'],
  tagName: 'section',
  showSessionAttendanceRequired: false,
  showSessionSupplemental: false,
  showSessionSpecialAttireRequired: false,
  showSessionSpecialEquipmentRequired: false,
});
