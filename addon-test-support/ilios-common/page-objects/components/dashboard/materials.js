import {
  attribute,
  clickable,
  collection,
  create,
  fillable,
  hasClass,
  isPresent,
  notHasClass,
  property,
  text,
  value,
} from 'ember-cli-page-object';
import dashboardViewPicker from './view-picker';
import controls from '../pagedlist-controls';
import displayToggle from '../toggle-buttons';
import status from '../user-material-status';

const definition = {
  scope: '[data-test-dashboard-materials]',
  dashboardViewPicker,
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
      sessionTitle: {
        scope: 'th:nth-of-type(2)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isSortedOn: notHasClass('fa-sort', 'svg'),
        click: clickable('button'),
      },
      courseTitle: {
        scope: 'th:nth-of-type(3)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isSortedOn: notHasClass('fa-sort', 'svg'),
        click: clickable('button'),
      },
      title: {
        scope: 'th:nth-of-type(4)',
        isSortedAscending: hasClass('fa-arrow-down-a-z', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-z-a', 'svg'),
        isSortedOn: notHasClass('fa-sort', 'svg'),
        click: clickable('button'),
      },
      instructor: {
        scope: 'th:nth-of-type(5)',
      },
      firstOfferingDate: {
        scope: 'th:nth-of-type(6)',
        isSortedAscending: hasClass('fa-arrow-down-1-9', 'svg'),
        isSortedDescending: hasClass('fa-arrow-down-9-1', 'svg'),
        isSortedOn: notHasClass('fa-sort', 'svg'),
        click: clickable('button'),
      },
    },
    rows: collection('[data-test-learning-material]', {
      status,
      sessionTitle: text('[data-test-session-title]'),
      courseTitle: text('[data-test-course-title]'),
      title: text('[data-test-title]'),
      isTimed: isPresent('[data-test-is-blanked]'),
      isLink: hasClass('fa-link', '[data-test-lm-type-icon]'),
      isCitation: hasClass('fa-paragraph', '[data-test-lm-type-icon]'),
      isPdf: hasClass('fa-file-pdf', '[data-test-lm-type-icon]'),
      isPowerpoint: hasClass('fa-file-powerpoint', '[data-test-lm-type-icon]'),
      isVideo: hasClass('fa-file-video', '[data-test-lm-type-icon]'),
      isAudio: hasClass('fa-file-audio', '[data-test-lm-type-icon]'),
      isFile: hasClass('fa-file', '[data-test-lm-type-icon]'),
      pdfLink: {
        scope: '[data-test-pdf-link]',
        url: attribute('href'),
      },
      pdfDownloadLink: {
        scope: '[data-test-pdf-download-link]',
        url: attribute('href'),
      },
      fileLink: {
        scope: '[data-test-file-link]',
        url: attribute('href'),
      },
      link: {
        scope: '[data-test-link]',
        url: attribute('href'),
      },
      instructors: text('[data-test-instructors]'),
      firstOfferingDate: text('[data-test-date]'),
    }),
    noResults: {
      scope: '[data-test-none]',
    },
  },
};

export default definition;
export const component = create(definition);
