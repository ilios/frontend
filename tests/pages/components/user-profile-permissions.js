import {
  clickable,
  create,
  collection,
  isPresent,
  fillable,
  value,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-profile-permissions]',
  title: text('[data-test-title]', { at: 0}),
  schools: collection('[data-test-select-school] option'),
  selectedSchool: value('[data-test-select-school]'),
  changeSchool: fillable('[data-test-select-school]'),
  years: collection('[data-test-select-year] option'),
  selectedYear: value('[data-test-select-year]'),
  changeYear: fillable('[data-test-select-year]'),
  school: {
    scope: '[data-test-school-permissions]',
    title: text('[data-test-title]'),
    director: text('[data-test-director] [data-test-yes-no]'),
    administrator: text('[data-test-administrator] [data-test-yes-no]'),
    toggle: clickable()
  },
  programs: {
    scope: '[data-test-program-permissions]',
    title: text('[data-test-title]'),
    directors: collection('[data-test-directors] [data-test-program]'),
    notDirecting: isPresent('[data-test-directors] [data-test-none]'),
    toggle: clickable()
  },
  programYears: {
    scope: '[data-test-program-year-permissions]',
    title: text('[data-test-title]'),
    directors: collection('[data-test-directors] [data-test-program]'),
    notDirecting: isPresent('[data-test-directors] [data-test-none]'),
    toggle: clickable()
  },
  courses: {
    scope: '[data-test-course-permissions]',
    title: text('[data-test-title]'),
    directors: collection('[data-test-directors] [data-test-course]'),
    notDirecting: isPresent('[data-test-directors] [data-test-none]'),
    administrators: collection('[data-test-administrators] [data-test-course]'),
    notAdministrating: isPresent('[data-test-administrators] [data-test-none]'),
    instructors: collection('[data-test-instructors] [data-test-course]'),
    notInstructing: isPresent('[data-test-instructors] [data-test-none]'),
    studentAdvisors: collection('[data-test-student-advisors] [data-test-course]'),
    notStudentAdvising: isPresent('[data-test-student-advisors] [data-test-none]'),
    toggle: clickable()
  },
  sessions: {
    scope: '[data-test-session-permissions]',
    title: text('[data-test-title]'),
    administrators: collection('[data-test-administrators] [data-test-course]'),
    notAdministrating: isPresent('[data-test-administrators] [data-test-none]'),
    instructors: collection('[data-test-instructors] [data-test-course]'),
    notInstructing: isPresent('[data-test-instructors] [data-test-none]'),
    studentAdvisors: collection('[data-test-student-advisors] [data-test-course]'),
    notStudentAdvising: isPresent('[data-test-student-advisors] [data-test-none]'),
    toggle: clickable()
  },
};

export default definition;
export const component = create(definition);
