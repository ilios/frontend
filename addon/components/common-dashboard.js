import Ember from 'ember';
import layout from '../templates/components/common-dashboard';

export default Ember.Component.extend({
  layout,
  classNames: ['common-dashboard'],
  tagName: 'section',
  show: 'week',
  selectedDate: null,
  selectedView: 'week',
  mySchedule: true,
  showFilters: false,
  selectedAcademicYear: null,
  selectedSchool: null,
  courseFilters: null,
});
