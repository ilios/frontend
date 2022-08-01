import { attribute, create, isPresent, text } from 'ember-cli-page-object';
import typeIcon from '../lm-type-icon';

const definition = {
  title: text('[data-test-material-title]'),
  typeIcon,
  hasPublicNotes: isPresent('[data-test-public-notes]'),
  publicNotes: text('[data-test-public-notes]'),
  hasCitation: isPresent('[data-test-citation]'),
  citation: text('[data-test-citation]'),
  url: attribute('href', '[data-test-material-title]'),
  timedReleaseInfo: text('[data-test-time-release-info]'),
  hasLink: isPresent('a'),
};

export default definition;
export const component = create(definition);
