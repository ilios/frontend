import { attribute, create } from 'ember-cli-page-object';
import toggle from 'frontend/tests/pages/components/toggle-yesno';
import calendar from 'frontend/tests/pages/components/weekly-calendar';

const definition = {
  scope: '[data-test-learner-group-calendar]',
  showSubgroups: {
    scope: '[data-test-learner-group-calendar-toggle-subgroup-events]',
    toggle,
    label: {
      scope: 'label',
    },
  },
  goBack: {
    scope: '[data-test-go-back]',
    linksTo: attribute('href'),
  },
  goToToday: {
    scope: '[data-test-go-today]',
    linksTo: attribute('href'),
  },
  goForward: {
    scope: '[data-test-go-forward]',
    linksTo: attribute('href'),
  },
  calendar,
};

export default definition;
export const component = create(definition);
