import {
  attribute,
  create,
  collection,
  isPresent,
  text
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-single-event]',
  title: text('[data-test-title]'),
  offeredAt: text('[data-test-offered-at]'),
  offeredAtLink: attribute('href', '[data-test-offered-at] a'),
  preWork: collection('[data-test-pre-work] li', {
    title: text(),
    hasLink: isPresent('a'),
  }),
  sessionLearningMaterials: {
    scope: '[data-test-session-materials]',
    linksToAllMaterials: isPresent('[data-test-link-to-all-materials]')
  }
};

export default definition;
export const component = create(definition);
