import {
  attribute,
  collection,
  create,
  clickable,
  isVisible,
  property,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-publish-all-sessions]',
  unpublishableSessions: {
    scope: '[data-test-unpublishable]',
    isExpanded: isVisible('[data-test-content]'),
    canExpandCollapse: isVisible('[data-test-expand-collapse]'),
    toggle: clickable('[data-test-expand-collapse]'),
    sessions: collection('tbody tr', {
      url: attribute('href', '[data-test-title] a'),
      title: text('[data-test-title]'),
      offerings: text('[data-test-offerings]'),
      terms: text('[data-test-terms]'),
      objectives: {
        scope: '[data-test-objectives]',
        isLinked: isVisible('[data-test-session-link]'),
        transitionToSession: {
          scope: '[data-test-session-link]',
        },
      },
      meshDescriptors: text('[data-test-mesh-descriptors]'),
    }),
  },
  publishableSessions: {
    scope: '[data-test-publishable]',
    title: text('> [data-test-title]'),
    isExpanded: isVisible('[data-test-content]'),
    canExpandCollapse: isVisible('[data-test-expand-collapse]'),
    toggle: clickable('[data-test-expand-collapse]'),
    sessions: collection('tbody tr', {
      url: attribute('href', '[data-test-title] a'),
      title: text('[data-test-title]'),
      offerings: text('[data-test-offerings]'),
      terms: text('[data-test-terms]'),
      objectives: {
        scope: '[data-test-objectives]',
        isLinked: isVisible('[data-test-session-link]'),
        transitionToSession: {
          scope: '[data-test-session-link]',
        },
      },
      meshDescriptors: text('[data-test-mesh-descriptors]'),
    }),
  },
  overridableSessions: {
    scope: '[data-test-overridable]',
    title: text('> [data-test-title]'),
    publishAllAsIs: {
      scope: '[data-test-publish-all-as-is]',
      isDisabled: property('disabled'),
    },
    markAllAsScheduled: {
      scope: '[data-test-mark-all-as-scheduled]',
      isDisabled: property('disabled'),
    },
    sessions: collection('tbody tr', {
      publishAsIs: {
        scope: '[data-test-publish-as-is]',
        isChecked: property('checked'),
      },
      markAsScheduled: {
        scope: '[data-test-mark-as-scheduled]',
        isChecked: property('checked'),
      },
      url: attribute('href', '[data-test-title] a'),
      title: text('[data-test-title]'),
      offerings: text('[data-test-offerings]'),
      terms: text('[data-test-terms]'),
      objectives: {
        scope: '[data-test-objectives]',
        isLinked: isVisible('[data-test-session-link]'),
        transitionToSession: {
          scope: '[data-test-session-link]',
        },
      },
      meshDescriptors: text('[data-test-mesh-descriptors]'),
    }),
  },
  review: {
    scope: '[data-test-review]',
    hasUnlinkedObjectives: isVisible('[data-test-unlinked-warning]'),
    unlinkedObjectivesWarning: text('[data-test-unlinked-warning]'),
    transitionToCourse: {
      scope: '[data-test-course-link]',
    },
    visualize: {
      scope: '[data-test-visualize]',
    },
    confirmation: text('[data-test-confirmation]'),
    save: clickable('[data-test-save]'),
  },
  hasUnlinkedWarning: isVisible('[data-test-unlinked-warning]'),
};

export default definition;
export const component = create(definition);
