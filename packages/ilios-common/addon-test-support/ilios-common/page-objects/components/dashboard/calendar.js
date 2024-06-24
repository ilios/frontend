import { collection, create, fillable, property } from 'ember-cli-page-object';
import weeklyCalendar from './../weekly-calendar';
import dailyCalendar from './../daily-calendar';
import weekGlance from './../week-glance';
import monthlyCalendar from './../monthly-calendar';
import toggle from '../toggle-buttons';
import userContextFilter from './user-context-filter';
import calendarFilters from './calendar-filters';
import filterTags from './filter-tags';

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
    userContexts: {
      scope: '[data-test-usercontexts]',
      toggle: userContextFilter,
    },
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
    calendarFilters,
  },
  filterTags,
  dailyCalendar,
  weekGlance,
  weeklyCalendar,
  monthlyCalendar,
};

export default definition;
export const component = create(definition);
