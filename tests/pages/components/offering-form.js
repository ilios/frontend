import {
  clickable,
  collection,
  fillable
} from 'ember-cli-page-object';

import { datePicker } from 'ilios/tests/helpers/date-picker';
import learnerGroupManager from './learner-group-manager';


export default {
  scope: '.offering-form',
  startDate: datePicker('.start-date input'),
  startTime: {
    scope: '.start-time',
    hour: fillable('select', { at: 0}),
    minutes: fillable('select', { at: 1}),
    ampm: fillable('select', { at: 2}),
  },
  hours: fillable('.offering-duration .hours input'),
  minutes: fillable('.offering-duration .minutes input'),
  location: fillable('.room input'),
  toggleRecurring: clickable('.make-recurring .toggle-yesno'),
  recurringWeeks: fillable('.make-recurring-input'),
  learnerGroupManager,
  instructorSelectionManager: {
    scope: '[data-test-instructor-selection-manager]',
    search: fillable('.search-box input'),
    searchResults: collection({
      scope: '.results',
      itemScope: '[data-test-result]',
      item: {
        add: clickable(),
      },
    }),
    instructors: collection({
      scope: '[data-test-instructors]',
      itemScope: 'li',
      item: {
        remove: clickable()
      }
    }),
    instructorGroups: collection({
      scope: '[data-test-instructor-groups]',
      itemScope: 'li',
      item: {
        remove: clickable()
      }
    }),
  },
  save: clickable('.done'),
};
