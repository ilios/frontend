import {
  clickable,
  collection,
  fillable
} from 'ember-cli-page-object';

import { datePicker } from 'ilios/tests/helpers/date-picker';
import learnerGroupManager from './learner-group-manager';
import instructorSelectionManager from './instructor-selection-manager';


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
  instructorSelectionManager,
  save: clickable('.done'),
};
