import { create, hasClass } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-sessions-grid-header]',
  expandCollapse: {
    scope: '[data-test-expand-collapse-all]',
    toggle: {
      scope: 'button',
    },
  },
  allAreExpanded: hasClass('caret-down', '[data-test-expand-collapse-all] svg'),
  title: {
    scope: '[data-test-title]',
  },
  sessionType: {
    scope: '[data-test-session-type]',
  },
  learnerGroupCount: {
    scope: '[data-test-learner-group-count]',
  },
  objectiveCount: {
    scope: '[data-test-objective-count]',
  },
  termCount: {
    scope: '[data-test-term-count]',
  },
  firstOffering: {
    scope: '[data-test-first-offering]',
  },
  offeringCount: {
    scope: '[data-test-offering-count]',
  },
  status: {
    scope: '[data-test-status]',
  },
};

export default definition;
export const component = create(definition);
