import { clickable, collection, create, hasClass, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-single-event-objective-list]',
  title: {
    scope: '[data-test-title]',
    expandCollapseSwitcher: {
      scope: '[data-test-expand-collapse]',
      isExpanded: hasClass('expanded'),
      toggle: clickable(),
    },
    displayModeSwitcher: {
      scope: '[data-test-display-mode-toggle]',
      isDisabled: property('disabled'),
      isListMode: hasClass('active'),
      toggle: clickable(),
    },
  },
  tree: {
    scope: '[data-test-tree]',
    domains: collection('[data-test-domain]', {
      title: text('[data-test-domain-title]'),
      objectives: collection('[data-test-objective]'),
    }),
  },
  list: {
    scope: '[data-test-list]',
    objectives: collection('[data-test-objective]', {
      title: text('[data-test-objective-title]'),
      domain: text('[data-test-domain]'),
    }),
    noContent: {
      scope: '[data-test-no-content]',
    },
  },
  noContent: {
    scope: '[data-test-no-content]',
  },
};

export default definition;
export const component = create(definition);
