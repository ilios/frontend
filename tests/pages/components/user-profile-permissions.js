import {
  create,
  collection,
  isPresent,
  value,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-profile-permissions]',
  title: text('[data-test-title]', { at: 0}),
  schools: collection('[data-test-select-school] option'),
  selectedSchool: value('[data-test-select-school]'),
  years: collection('[data-test-select-year] option'),
  selectedYear: value('[data-test-select-year]'),
  school: {
    scope: '[data-test-school-permissions]',
    title: text('[data-test-title]'),
    director: text('[data-test-director] [data-test-yes-no]'),
    administrator: text('[data-test-administrator] [data-test-yes-no]'),
  },
  programs: {
    scope: '[data-test-program-permissions]',
    title: text('[data-test-title]'),
    directors: text('[data-test-directors] [data-test-director]'),
    notDirecting: isPresent('[data-test-directors] [data-test-none]'),
    administrators: text('[data-test-administrators] [data-test-administrator]'),
    notAdministrating: isPresent('[data-test-administrators] [data-test-none]'),
  },
  programYears: {
    scope: '[data-test-program-year-permissions]',
    title: text('[data-test-title]'),
    directors: text('[data-test-directors] [data-test-director]'),
    notDirecting: isPresent('[data-test-directors] [data-test-none]'),
    administrators: text('[data-test-administrators] [data-test-administrator]'),
    notAdministrating: isPresent('[data-test-administrators] [data-test-none]'),
  },
  courses: {
    scope: '[data-test-course-permissions]',
    title: text('[data-test-title]'),
    directors: text('[data-test-directors] [data-test-director]'),
    notDirecting: isPresent('[data-test-directors] [data-test-none]'),
    administrators: text('[data-test-administrators] [data-test-administrator]'),
    notAdministrating: isPresent('[data-test-administrators] [data-test-none]'),
    instructors: text('[data-test-instructors] [data-test-instructor]'),
    notInstructing: isPresent('[data-test-instructors] [data-test-none]'),
  },
  sessions: {
    scope: '[data-test-session-permissions]',
    title: text('[data-test-title]'),
    administrators: text('[data-test-administrators] [data-test-administrator]'),
    notAdministrating: isPresent('[data-test-administrators] [data-test-none]'),
    instructors: text('[data-test-instructors] [data-test-instructor]'),
    notInstructing: isPresent('[data-test-instructors] [data-test-none]'),
  },
};

export default definition;
export const component = create(definition);
