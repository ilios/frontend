import { clickable, collection, create, hasClass } from 'ember-cli-page-object';

import listItem from './school-session-types-list-item';

const definition = {
  scope: '[data-test-school-session-types-list]',
  sessionTypes: collection('[data-test-school-session-types-list-item]', listItem),
  sortByTitle: clickable('button', { scope: '[data-test-headings] th:nth-of-type(1)' }),
  sortByActiveStatus: clickable('button', { scope: '[data-test-headings] th:nth-of-type(2)' }),
  sortBySessions: clickable('button', { scope: '[data-test-headings] th:nth-of-type(3)' }),
  sortByAssessment: clickable('button', { scope: '[data-test-headings] th:nth-of-type(4)' }),
  sortByAssessmentOption: clickable('button', { scope: '[data-test-headings] th:nth-of-type(5)' }),
  sortByAamcMethod: clickable('button', { scope: '[data-test-headings] th:nth-of-type(6)' }),
  sortByColor: clickable('button', { scope: '[data-test-headings] th:nth-of-type(7)' }),
  isSortedByTitleAscending: hasClass('fa-arrow-down-a-z', '[data-test-headings] th:eq(0) svg'),
  isSortedByTitleDescending: hasClass('fa-arrow-down-z-a', '[data-test-headings] th:eq(0) svg'),
  isSortedByActiveStatusAscending: hasClass(
    'fa-arrow-down-a-z',
    '[data-test-headings] th:eq(1) svg'
  ),
  isSortedByActiveStatusDescending: hasClass(
    'fa-arrow-down-z-a',
    '[data-test-headings] th:eq(1) svg'
  ),
  isSortedBySessionsAscending: hasClass('fa-arrow-down-1-9', '[data-test-headings] th:eq(2) svg'),
  isSortedBySessionsDescending: hasClass('fa-arrow-down-9-1', '[data-test-headings] th:eq(2) svg'),
  isSortedByAssessmentAscending: hasClass('fa-arrow-down-a-z', '[data-test-headings] th:eq(3) svg'),
  isSortedByAssessmentDescending: hasClass(
    'fa-arrow-down-z-a',
    '[data-test-headings] th:eq(3) svg'
  ),
  isSortedByAssessmentOptionAscending: hasClass(
    'fa-arrow-down-a-z',
    '[data-test-headings] th:eq(4) svg'
  ),
  isSortedByAssessmentOptionDescending: hasClass(
    'fa-arrow-down-z-a',
    '[data-test-headings] th:eq(4) svg'
  ),
  isSortedByAamcMethodAscending: hasClass('fa-arrow-down-a-z', '[data-test-headings] th:eq(5) svg'),
  isSortedByAamcMethodDescending: hasClass(
    'fa-arrow-down-z-a',
    '[data-test-headings] th:eq(5) svg'
  ),
  isSortedByColorAscending: hasClass('fa-arrow-down-a-z', '[data-test-headings] th:eq(6) svg'),
  isSortedByColorDescending: hasClass('fa-arrow-down-z-a', '[data-test-headings] th:eq(6) svg'),
};

export default definition;
export const component = create(definition);
