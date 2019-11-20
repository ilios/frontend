import Component from '@ember/component';
export default Component.extend({
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

  selectedCohorts: null,
  selectedCourseLevels: null,
  selectedCourses: null,
  selectedSessionTypes: null,
  selectedTerms: null,
  onClearFilters() {},
  onUpdateCohorts() {},
  onUpdateCourseLevels() {},
  onUpdateCourses() {},
  onUpdateSessionTypes() {},
  onUpdateTerms() {}
});
