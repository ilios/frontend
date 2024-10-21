import { attribute, clickable, create, collection, isPresent, text } from 'ember-cli-page-object';
import objectiveList from './single-event-objective-list';
import materials from './single-event-learningmaterial-list';

const definition = {
  scope: '[data-test-single-event]',
  summary: {
    scope: '[data-test-summary]',
    header: {
      scope: '[data-test-header]',
      hasLink: isPresent('a'),
      title: text('[data-test-header-title]'),
      isScheduled: isPresent('[data-test-scheduled-icon]'),
      isDraft: isPresent('[data-test-draft-icon]'),
      wasRecentlyUpdated: isPresent('[data-test-recently-updated-icon]'),
    },
    offeredAt: text('[data-test-offered-at]'),
    offeredAtLink: attribute('href', '[data-test-offered-at] a'),
    preWork: collection('[data-test-pre-work] li', {
      title: text(),
      hasLink: isPresent('a'),
    }),
  },
  sessionObjectives: {
    scope: '[data-test-session-objectives]',
    objectiveList,
  },
  sessionLearningMaterials: {
    scope: '[data-test-session-materials]',
    expandCollapseSwitcher: {
      scope: '[data-test-expand-collapse]',
      ariaExpanded: attribute('aria-expanded'),
      ariaLabel: attribute('aria-label'),
      toggle: clickable(),
    },
    linksToAllMaterials: isPresent('[data-test-link-to-all-materials]'),
    materials,
  },
  courseObjectives: {
    scope: '[data-test-course-objectives]',
    objectiveList,
  },
  courseLearningMaterials: {
    scope: '[data-test-course-materials]',
    title: text('h2 [data-test-title]'),
    expandCollapseSwitcher: {
      scope: '[data-test-expand-collapse]',
      ariaExpanded: attribute('aria-expanded'),
      ariaLabel: attribute('aria-label'),
      toggle: clickable(),
    },
    linksToAllMaterials: isPresent('[data-test-link-to-all-materials]'),
    materials,
  },
};

export default definition;
export const component = create(definition);
