import Component from '@ember/component';
import layout from '../templates/components/common-dashboard';

export default Component.extend({
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
