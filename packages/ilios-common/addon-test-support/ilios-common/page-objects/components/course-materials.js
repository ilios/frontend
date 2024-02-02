import {
  attribute,
  clickable,
  create,
  collection,
  fillable,
  isPresent,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-course-materials]',
  courseFilter: fillable('[data-test-course-filter]'),
  sortCoursesBy: {
    scope: '[data-test-course-table] thead',
    title: clickable('th:nth-of-type(1) button'),
    type: clickable('th:nth-of-type(2) button'),
    author: clickable('th:nth-of-type(3) button'),
  },
  courses: collection('[data-test-course-table] tbody tr', {
    title: text('td', { at: 0 }),
    hasLink: isPresent('a', { scope: 'td:nth-of-type(1)' }),
    link: attribute('href', 'a', { scope: 'td:nth-of-type(1)' }),
    type: text('td', { at: 1 }),
    author: text('td', { at: 2 }),
  }),
  sessionFilter: fillable('[data-test-session-filter]'),
  sortSessionsBy: {
    scope: '[data-test-session-table] thead',
    title: clickable('th:nth-of-type(1) button'),
    type: clickable('th:nth-of-type(2) button'),
    author: clickable('th:nth-of-type(3) button'),
    sessionTitle: clickable('th:nth-of-type(4) button'),
    firstOffering: clickable('th:nth-of-type(5) button'),
  },
  sessions: collection('[data-test-session-table] tbody tr', {
    title: text('td', { at: 0 }),
    link: attribute('href', 'a', { scope: 'td:nth-of-type(1)' }),
    hasLink: isPresent('a', { scope: 'td:nth-of-type(1)' }),
    type: text('td', { at: 1 }),
    author: text('td', { at: 2 }),
    sessionTitle: text('td', { at: 3 }),
    firstOffering: text('td', { at: 4 }),
  }),
};

export default definition;
export const component = create(definition);
