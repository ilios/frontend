import { attribute, create } from 'ember-cli-page-object';
import toggle from 'ilios-common/page-objects/components/toggle-yesno';
import calendar from 'ilios-common/page-objects/components/weekly-calendar';

const definition = {
  scope: '[data-test-learnergroup-calendar]',
  showSubgroups: {
    scope: '[data-test-learnergroup-calendar-toggle-subgroup-events]',
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
