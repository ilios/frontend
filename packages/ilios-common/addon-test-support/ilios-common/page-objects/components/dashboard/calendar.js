import { collection, create, fillable, property } from 'ember-cli-page-object';
import toggle from '../toggle-buttons';
import userContextFilter from './user-context-filter';
import filters from './calendar-filters';
import filterTags from './filter-tags';
import calendar from './../ilios-calendar';

const definition = {
  scope: '[data-test-dashboard-calendar]',
  controls: {
    scope: '[data-test-dashboard-calendar-controls]',
    mySchedule: {
      scope: '[data-test-myschedule]',
      toggle,
    },
    showFilters: {
      scope: '[data-test-showfilters]',
      toggle,
    },
    showCourseFilters: {
      scope: '[data-test-showcoursefilters]',
      toggle,
    },
    userContextFilter,
    schoolPicker: {
      scope: '[data-test-schoolpicker]',
      select: {
        scope: '[data-test-select-school]',
        set: fillable(),
        options: collection('option', {
          isSelected: property('selected'),
        }),
      },
    },
    filters,
  },
  filterTags,
  calendar,
};

export default definition;
export const component = create(definition);
