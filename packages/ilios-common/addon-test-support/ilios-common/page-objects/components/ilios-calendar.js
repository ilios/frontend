import { attribute, collection, create, isHidden } from 'ember-cli-page-object';
import daily from './daily-calendar';
import weekly from './weekly-calendar';
import monthly from './monthly-calendar';
import icsFeed from './ics-feed';

const definition = {
  scope: '[data-test-ilios-calendar]',
  daily,
  weekly,
  monthly,
  icsFeedToggle: {
    scope: '[data-test-ics]',
  },
  viewModes: collection('[data-test-view-mode]', {
    isActive: isHidden('a'),
    linksTo: attribute('href', 'a'),
  }),
  goBack: {
    scope: '[data-test-go-back]',
    linksTo: attribute('href'),
  },
  goToToday: {
    scope: '[data-test-go-to-today]',
    linksTo: attribute('href'),
  },
  goForward: {
    scope: '[data-test-go-forward]',
    linksTo: attribute('href'),
  },
  icsFeed,
};

export default definition;
export const component = create(definition);
