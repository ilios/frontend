import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  property,
  text,
  triggerable,
  value,
} from 'ember-cli-page-object';
import learnerSelectionManager from './learner-selection-manager';
import learnergroupSelectionManager from './learnergroup-selection-manager';
import instructorSelectionManager from './instructor-selection-manager';
import yesNoToggle from './toggle-yesno';
import datePicker from './date-picker';
import timePicker from './time-picker';

const definition = {
  scope: '[data-test-offering-form]',
  startDate: {
    scope: '.start-date',
    datePicker,
  },
  endDate: {
    scope: '.end-date-time',
    label: text('label'),
    value: text('.text'),
  },
  startTime: {
    scope: '.start-time',
    timePicker,
  },
  duration: {
    scope: '.offering-duration',
    hours: {
      scope: '.hours',
      set: fillable('input'),
      submit: triggerable('keypress', 'input', {
        eventProperties: { key: 'Enter' },
      }),
      value: value('input'),
      hasError: isPresent('[data-test-duration-hours-validation-error-message]'),
      error: text('[data-test-duration-hours-validation-error-message]'),
    },
    minutes: {
      scope: '.minutes',
      set: fillable('input'),
      submit: triggerable('keypress', 'input', {
        eventProperties: { key: 'Enter' },
      }),
      value: value('input'),
      hasError: isPresent('[data-test-duration-minutes-validation-error-message]'),
      error: text('[data-test-duration-minutes-validation-error-message]'),
    },
  },
  timezoneEditor: {
    scope: '[data-test-timezone-picker]',
    currentTimezone: {
      scope: '[data-test-current-timezone]',
      edit: clickable('button'),
    },
    label: {
      scope: 'label',
    },
    picker: {
      scope: '.picker select',
      select: fillable(),
    },
    cancel: clickable('.actions .cancel'),
  },
  location: {
    scope: '.room',
    set: fillable('input'),
    value: value('input'),
    hasError: isPresent('[data-test-room-validation-error-message]'),
    error: text('[data-test-room-validation-error-message]'),
    submit: triggerable('keypress', 'input', {
      eventProperties: { key: 'Enter' },
    }),
  },
  url: {
    scope: '[data-test-url]',
    set: fillable('input'),
    value: value('input'),
    hasError: isPresent('[data-test-url-validation-error-message]'),
    error: text('[data-test-url-validation-error-message]'),
    submit: triggerable('keypress', 'input', {
      eventProperties: { key: 'Enter' },
    }),
  },
  recurring: {
    scope: '.make-recurring',
    yesNoToggle,
    setWeeks: fillable('.make-recurring-input'),
    hasError: isPresent('[data-test-number-of-weeks-validation-error-message]'),
    error: text('[data-test-number-of-weeks-validation-error-message]'),
    weekdays: collection('[data-test-make-recurring-day]', {
      label: text('[data-test-recurring-day-label]'),
      input: {
        scope: '[data-test-recurring-day-input]',
        toggle: clickable(),
        isSelected: property('checked'),
        isDisabled: property('disabled'),
      },
    }),
  },
  instructorSelectionManager,
  learnerManager: {
    scope: '[data-test-learner-management]',
    learnerSelectionManager,
    learnergroupSelectionManager,
    hasError: isPresent('[data-test-learner-groups-validation-error-message]'),
    error: text('[data-test-learner-groups-validation-error-message]'),
  },

  save: clickable('.done'),
  close: clickable('.cancel'),
};

export default definition;
export const component = create(definition);
