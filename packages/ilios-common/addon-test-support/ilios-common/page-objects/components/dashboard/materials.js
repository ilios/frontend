import {
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  notHasClass,
  property,
  text,
  value,
} from 'ember-cli-page-object';
import controls from '../pagedlist-controls';
import displayToggle from '../toggle-buttons';
import materialListItem from './material-list-item';

const definition = {
  scope: '[data-test-dashboard-materials]',
  title: text('[data-test-materials-title]'),
  header: {
    scope: '[data-test-materials-header]',
    displayToggle,
  },
  courseFilter: {
    scope: '[data-test-course-filter]',
    set: fillable('select'),
    value: value('select'),
    options: collection('option', {
      isSelected: property('selected'),
      isDisabled: property('disabled'),
    }),
  },
  textFilter: {
    scope: '[data-test-text-filter]',
    set: fillable('input'),
    value: value('input'),
  },
  topPaginator: {
    scope: '[data-test-paginator-top]',
    controls,
  },
  bottomPaginator: {
    scope: '[data-test-paginator-bottom]',
    controls,
  },
  table: {
    scope: 'table',
    headers: {
      scope: 'thead',
      status: {
        scope: 'th:nth-of-type(1)',
      },
      title: {
        scope: 'th:nth-of-type(2)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isSortedOn: notHasClass('fa-sort', 'svg'),
        click: clickable('button'),
      },
      sessionTitle: {
        scope: 'th:nth-of-type(3)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isSortedOn: notHasClass('fa-sort', 'svg'),
        click: clickable('button'),
      },
      courseTitle: {
        scope: 'th:nth-of-type(4)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isSortedOn: notHasClass('fa-sort', 'svg'),
        click: clickable('button'),
      },
      courseSessionTitle: {
        scope: 'th:nth-of-type(5)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isSortedOn: notHasClass('fa-sort', 'svg'),
        click: clickable('button'),
      },
      instructor: {
        scope: 'th:nth-of-type(6)',
      },
      firstOfferingDate: {
        scope: 'th:nth-of-type(7)',
        isSortedAscending: hasClass('fa-arrow-down-1-9', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-9-1', 'svg'),
        isSortedOn: notHasClass('fa-sort', 'svg'),
        click: clickable('button'),
      },
    },
    rows: collection('[data-test-learning-material]', materialListItem),
    noResults: {
      scope: '[data-test-none]',
    },
  },
};

export default definition;
export const component = create(definition);
