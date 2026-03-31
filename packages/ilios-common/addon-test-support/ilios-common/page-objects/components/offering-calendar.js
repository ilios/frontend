import { create, text } from 'ember-cli-page-object';
import weeklyCalendar from './ilios-calendar-week';
import toggle from './toggle-yesno';

const definition = {
  scope: '[data-test-offering-calendar]',
  title: text('[data-test-offering-calendar-title]'),
  filters: {
    scope: '[data-test-filters]',
    learnerGroupEvents: {
      scope: '[data-test-learner-group-events-filter]',
      toggle,
      label: text('label'),
    },
    sessionEvents: {
      scope: '[data-test-session-events-filter]',
      toggle,
      label: text('label'),
    },
  },
  weeklyCalendar,
};

export default definition;
export const component = create(definition);
