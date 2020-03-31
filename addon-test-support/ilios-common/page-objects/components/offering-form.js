import {clickable, collection, create, fillable, isVisible, property, text, value} from 'ember-cli-page-object';
import { datePicker } from 'ilios-common';
import learnerGroupManager from './learner-group-manager';
import learnerSelectionManager from './learner-selection-manager';

import instructorSelectionManager from './instructor-selection-manager';

const definition = {
  scope: '[data-test-offering-form]',
  startDate: {
    scope: '.start-date',
    set: datePicker('input'),
    value: value('input'),
  },
  endDate: {
    scope: '.end-date-time',
    label: text('label'),
    value: text('.text'),
  },
  startTime: {
    scope: '.start-time',
    hour: fillable('select', { at: 0}),
    minutes: fillable('select', { at: 1}),
    ampm: fillable('select', { at: 2}),
  },
  duration: {
    scope: '.offering-duration',
    hours: {
      scope: '.hours input',
      set: fillable(),
    },
    minutes: {
      scope: '.minutes input',
      set: fillable(),
    }
  },
  currentTimezone: {
    scope: '[data-test-current-timezone]',
    edit: clickable(),
  },
  timezoneEditor: {
    scope: '[data-test-timezone-picker]',
    label: {
      scope: 'label'
    },
    picker: {
      scope: '.picker select',
      select: fillable(),
    },
    cancel: clickable('.actions .cancel')
  },
  location: {
    scope: '.room',
    set: fillable('input'),
    value: value('input'),
    hasError: isVisible('.validation-error-message')
  },
  recurring: {
    scope: '.make-recurring',
    toggle: clickable('[data-test-toggle-yesno] [data-test-handle]'),
    setWeeks: fillable('.make-recurring-input'),
    hasError: isVisible('.validation-error-message'),
    weekdays: collection('[data-test-make-recurring-day]', {
      label: text('[data-test-recurring-day-label]'),
      input: {
        scope: '[data-test-recurring-day-input]',
        toggle: clickable(),
        isSelected: property('checked'),
        isDisabled: property('disabled'),
      }
    })
  },
  instructors: {
    scope: '.instructors',
    manager: instructorSelectionManager,
  },
  learners: {
    scope: '.learners',
    manager: learnerSelectionManager,
  },
  learnerGroups: {
    scope: '.learner-groups',
    manager: learnerGroupManager,
    hasError: isVisible('.validation-error-message')
  },
  save: clickable('.done'),
  close: clickable('.cancel')
};

export default definition;
export const component = create(definition);
